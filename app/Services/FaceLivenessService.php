<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use RuntimeException;

class FaceLivenessService
{
    public function hasBrowserConfiguration(): bool
    {
        return true;
    }

    public function createSession(): string
    {
        return (string) Str::uuid();
    }

    public function createChallengeToken(): string
    {
        return bin2hex(random_bytes(16));
    }

    public function storeSessionChallenge(string $sessionId, string $challengeToken): void
    {
        Cache::put($this->challengeCacheKey($sessionId), [
            'challenge_token' => $challengeToken,
        ], now()->addMinutes(3));
    }

    public function recordLocalVerification(
        string $sessionId,
        string $challengeToken,
        UploadedFile $capture,
        float $confidence,
        int $faceCount,
    ): array {
        $stored = Cache::get($this->challengeCacheKey($sessionId));

        if (! is_array($stored)
            || ! hash_equals((string) ($stored['challenge_token'] ?? ''), $challengeToken)) {
            throw new RuntimeException('The local verification challenge is invalid.');
        }

        $realPath = $capture->getRealPath();

        if (
            ! $capture->isValid()
            || ! is_string($realPath)
            || @getimagesize($realPath) === false
            || $confidence < 0.5
            || $confidence > 1
            || $faceCount !== 1
        ) {
            throw new RuntimeException('The local verification capture is invalid.');
        }

        $result = [
            'status' => 'SUCCEEDED',
            'confidence' => $confidence * 100,
            'face_count' => $faceCount,
        ];

        Cache::put($this->resultCacheKey($sessionId), $result, now()->addMinutes(3));

        return $result;
    }

    /**
     * @return array{status: string, confidence: float|null, face_count: int}
     */
    public function getSessionResults(string $sessionId): array
    {
        $result = Cache::get($this->resultCacheKey($sessionId));

        if (! is_array($result)) {
            return [
                'status' => 'FAILED',
                'confidence' => null,
                'face_count' => 0,
            ];
        }

        return [
            'status' => (string) ($result['status'] ?? 'FAILED'),
            'confidence' => isset($result['confidence']) && is_numeric($result['confidence'])
                ? (float) $result['confidence']
                : null,
            'face_count' => isset($result['face_count']) && is_numeric($result['face_count'])
                ? (int) $result['face_count']
                : 0,
        ];
    }

    private function challengeCacheKey(string $sessionId): string
    {
        return 'registration.face-liveness.challenge.'.hash('sha256', $sessionId);
    }

    private function resultCacheKey(string $sessionId): string
    {
        return 'registration.face-liveness.result.'.hash('sha256', $sessionId);
    }
}
