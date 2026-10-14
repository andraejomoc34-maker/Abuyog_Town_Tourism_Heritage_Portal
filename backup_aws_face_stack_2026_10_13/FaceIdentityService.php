<?php

namespace App\Services;

use App\Exceptions\DuplicateFaceIdentityException;
use App\Exceptions\UncertainFaceIdentityException;
use App\Models\FaceIdentity;
use App\Models\User;
use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class FaceIdentityService
{
    public function createUserWithEnrollment(string $image, Closure $createUser): User
    {
        $indexedFaceId = null;

        try {
            return $this->withRegistryLock(function () use ($image, $createUser, &$indexedFaceId): User {
                $this->assertNoDuplicate($image);

                $user = $createUser();
                $externalImageId = (string) Str::uuid();
                $indexedFaceId = app(FaceRecognitionService::class)->index($image, $externalImageId);

                $this->storeEnrollment($user, $indexedFaceId, $externalImageId);

                return $user;
            });
        } catch (Throwable $exception) {
            $this->deleteUncommittedFace($indexedFaceId);

            throw $exception;
        }
    }

    public function enrollExistingUser(User $user, string $image): bool
    {
        if ($user->role !== 'user') {
            throw new RuntimeException('Only customer accounts can enroll face identities.');
        }

        $indexedFaceId = null;

        try {
            return $this->withRegistryLock(function () use ($user, $image, &$indexedFaceId): bool {
                if (FaceIdentity::query()->where('user_id', $user->id)->exists()) {
                    return false;
                }

                $this->assertNoDuplicate($image);
                $externalImageId = (string) Str::uuid();
                $indexedFaceId = app(FaceRecognitionService::class)->index($image, $externalImageId);

                $this->storeEnrollment($user, $indexedFaceId, $externalImageId);

                return true;
            });
        } catch (Throwable $exception) {
            $this->deleteUncommittedFace($indexedFaceId);

            throw $exception;
        }
    }

    public function removeEnrollment(User $user): bool
    {
        return $this->withRegistryLock(function () use ($user): bool {
            $identity = FaceIdentity::query()->where('user_id', $user->id)->first();

            if (! $identity) {
                return false;
            }

            app(FaceRecognitionService::class)->delete($identity->face_id);
            $identity->delete();

            return true;
        });
    }

    private function assertNoDuplicate(string $image): void
    {
        $matches = app(FaceRecognitionService::class)->search($image);
        $matchThreshold = (float) config('services.face_recognition.match_threshold', 99);
        $uncertainThreshold = (float) config('services.face_recognition.uncertain_threshold', 90);
        usort($matches, fn (array $left, array $right): int => $right['similarity'] <=> $left['similarity']);

        foreach ($matches as $match) {
            if ($match['similarity'] < $uncertainThreshold) {
                continue;
            }

            $identity = FaceIdentity::query()
                ->where('external_image_id_hash', hash('sha256', $match['external_image_id']))
                ->where('face_id_hash', hash('sha256', $match['face_id']))
                ->first();

            if ($match['similarity'] >= $matchThreshold && $identity) {
                throw new DuplicateFaceIdentityException;
            }

            throw new UncertainFaceIdentityException;
        }
    }

    private function storeEnrollment(User $user, string $faceId, string $externalImageId): void
    {
        FaceIdentity::query()->create([
            'user_id' => $user->id,
            'face_id' => $faceId,
            'face_id_hash' => hash('sha256', $faceId),
            'external_image_id' => $externalImageId,
            'external_image_id_hash' => hash('sha256', $externalImageId),
            'consented_at' => now(),
        ]);
    }

    private function lockRegistry(): void
    {
        $lock = DB::table('face_identity_registration_locks')
            ->where('id', 1)
            ->lockForUpdate()
            ->first();

        if (! $lock) {
            throw new RuntimeException('The face identity registry lock is unavailable.');
        }
    }

    private function withRegistryLock(Closure $callback): mixed
    {
        $lock = Cache::lock('face-identity-registration', 120);

        if (! $lock->get()) {
            throw new RuntimeException('The face identity registry is busy.');
        }

        try {
            return DB::transaction(function () use ($callback): mixed {
                $this->lockRegistry();

                return $callback();
            });
        } finally {
            try {
                $lock->release();
            } catch (Throwable $exception) {
                report($exception);
            }
        }
    }

    private function deleteUncommittedFace(?string $faceId): void
    {
        if ($faceId === null) {
            return;
        }

        try {
            app(FaceRecognitionService::class)->delete($faceId);
        } catch (Throwable $cleanupException) {
            report($cleanupException);
        }
    }
}
