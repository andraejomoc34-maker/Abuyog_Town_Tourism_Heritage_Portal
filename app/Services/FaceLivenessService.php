<?php

namespace App\Services;

use Aws\Rekognition\RekognitionClient;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Psr\Http\Message\StreamInterface;
use RuntimeException;

class FaceLivenessService
{
    public function hasBrowserConfiguration(): bool
    {
        $confidenceThreshold = (float) config('services.face_liveness.confidence_threshold', 80);
        $region = config('services.face_liveness.region');
        $identityPoolId = config('services.face_liveness.identity_pool_id');
        $browserRegion = config('services.face_liveness.browser_region');
        $browserIdentityPoolId = config('services.face_liveness.browser_identity_pool_id');

        return filled($region)
            && filled($identityPoolId)
            && filled($browserRegion)
            && filled($browserIdentityPoolId)
            && $region === $browserRegion
            && $identityPoolId === $browserIdentityPoolId
            && $confidenceThreshold >= 80
            && $confidenceThreshold <= 100;
    }

    public function createSession(): string
    {
        if (! $this->hasBrowserConfiguration()) {
            throw new RuntimeException('Amazon Rekognition Face Liveness is not configured.');
        }

        $sessionId = $this->client()->createFaceLivenessSession([
            'Settings' => [
                'AuditImagesLimit' => 0,
            ],
        ])->get('SessionId');

        if (! is_string($sessionId) || $sessionId === '') {
            throw new RuntimeException('Amazon Rekognition did not return a liveness session.');
        }

        return $sessionId;
    }

    /**
     * @return array{status: string, confidence: float}
     */
    public function storeVerifiedReferenceImage(string $sessionId): array
    {
        $result = $this->client()->getFaceLivenessSessionResults([
            'SessionId' => $sessionId,
        ]);

        $confidence = $result->get('Confidence');
        $status = $result->get('Status');
        $referenceImage = $result->get('ReferenceImage');
        $bytes = is_array($referenceImage) ? ($referenceImage['Bytes'] ?? null) : null;

        if ($bytes instanceof StreamInterface) {
            $bytes = $bytes->getContents();
        } elseif (is_resource($bytes)) {
            $bytes = stream_get_contents($bytes);
        }

        if ($status !== 'SUCCEEDED'
            || ! is_numeric($confidence)
            || (float) $confidence < (float) config('services.face_liveness.confidence_threshold', 80)
            || (float) $confidence > 100
            || ! is_string($bytes)
            || $bytes === '') {
            throw new \UnexpectedValueException('Amazon Rekognition did not return a verified reference image.');
        }

        Cache::put(
            $this->referenceImageCacheKey($sessionId),
            Crypt::encryptString(base64_encode($bytes)),
            now()->addMinutes(3),
        );

        return [
            'status' => $status,
            'confidence' => (float) $confidence,
        ];
    }

    public function consumeVerifiedReferenceImage(string $sessionId): ?string
    {
        $encryptedImage = Cache::pull($this->referenceImageCacheKey($sessionId));

        if (! is_string($encryptedImage)) {
            return null;
        }

        try {
            $encodedImage = Crypt::decryptString($encryptedImage);
        } catch (DecryptException $exception) {
            report($exception);

            return null;
        }

        $decodedImage = base64_decode($encodedImage, true);

        return is_string($decodedImage) && $decodedImage !== '' ? $decodedImage : null;
    }

    public function hasVerifiedReferenceImage(string $sessionId): bool
    {
        return Cache::has($this->referenceImageCacheKey($sessionId));
    }

    public function forgetVerifiedReferenceImage(string $sessionId): void
    {
        Cache::forget($this->referenceImageCacheKey($sessionId));
    }

    private function client(): RekognitionClient
    {
        return new RekognitionClient([
            'version' => 'latest',
            'region' => config('services.face_liveness.region'),
        ]);
    }

    private function referenceImageCacheKey(string $sessionId): string
    {
        return 'registration.face-liveness.reference-image.'.hash('sha256', $sessionId);
    }
}
