<?php

namespace App\Services;

use App\Exceptions\DuplicateFaceIdentityException;
use App\Models\FaceIdentity;
use App\Models\User;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class FaceIdentityService
{
    public function createUserWithEnrollment(string $image, Closure $createUser): User
    {
        if (blank($image)) {
            throw new RuntimeException('A face image is required for registration.');
        }

        $enrollment = app(FaceVerificationService::class)->enroll($image);

        return DB::transaction(function () use ($image, $enrollment, $createUser): User {
            DB::table('face_identity_registration_locks')
                ->where('id', 1)
                ->lockForUpdate()
                ->first();

            $this->assertNoDuplicate($image, $enrollment['embedding']);

            $user = $createUser();
            $this->storeEnrollment($user, $enrollment['embedding']);

            return $user;
        });
    }

    public function removeEnrollment(User $user): bool
    {
        $identity = FaceIdentity::query()->where('user_id', $user->id)->first();

        if (! $identity) {
            return false;
        }

        $identity->delete();

        return true;
    }

    /**
     * @param  list<float>  $embedding
     */
    private function assertNoDuplicate(string $image, array $embedding): void
    {
        $distanceThreshold = (float) config('services.face_service.threshold', 0.40);

        if (config('services.face_service.distance_metric', 'cosine') !== 'cosine'
            || ! is_finite($distanceThreshold)
            || $distanceThreshold <= 0
            || $distanceThreshold > 2) {
            throw new RuntimeException('The configured face comparison settings are not supported.');
        }

        foreach (FaceIdentity::query()->cursor() as $identity) {
            $storedEmbedding = $identity->embedding;

            if (is_array($storedEmbedding) && $storedEmbedding !== []) {
                if ($this->cosineDistance($embedding, $storedEmbedding) <= $distanceThreshold) {
                    throw new DuplicateFaceIdentityException;
                }

                continue;
            }

            if (filled($identity->reference_image)
                && app(FaceVerificationService::class)->matchesLegacyReference(
                    $image,
                    (string) $identity->reference_image,
                )) {
                throw new DuplicateFaceIdentityException;
            }
        }
    }

    /**
     * @param  list<float>  $left
     * @param  list<float>  $right
     */
    private function cosineDistance(array $left, array $right): float
    {
        if (count($left) !== count($right) || $left === [] || $right === []) {
            throw new RuntimeException('A stored face enrollment has an invalid embedding.');
        }

        $dotProduct = 0.0;
        $leftMagnitude = 0.0;
        $rightMagnitude = 0.0;

        foreach ($left as $index => $leftValue) {
            $rightValue = $right[$index] ?? null;

            if (! is_numeric($leftValue)
                || ! is_finite((float) $leftValue)
                || ! is_numeric($rightValue)
                || ! is_finite((float) $rightValue)) {
                throw new RuntimeException('A stored face enrollment has an invalid embedding.');
            }

            $leftFloat = (float) $leftValue;
            $rightFloat = (float) $rightValue;
            $dotProduct += $leftFloat * $rightFloat;
            $leftMagnitude += $leftFloat ** 2;
            $rightMagnitude += $rightFloat ** 2;
        }

        if ($leftMagnitude === 0.0 || $rightMagnitude === 0.0) {
            throw new RuntimeException('A stored face enrollment has an invalid embedding.');
        }

        return 1 - ($dotProduct / (sqrt($leftMagnitude) * sqrt($rightMagnitude)));
    }

    /**
     * @param  list<float>  $embedding
     */
    private function storeEnrollment(User $user, array $embedding): void
    {
        $faceId = (string) Str::uuid();
        $externalImageId = (string) Str::uuid();

        FaceIdentity::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'face_id' => $faceId,
                'face_id_hash' => hash('sha256', $faceId),
                'external_image_id' => $externalImageId,
                'external_image_id_hash' => hash('sha256', $externalImageId),
                'embedding' => $embedding,
                'reference_image' => null,
                'consented_at' => now(),
            ],
        );
    }
}
