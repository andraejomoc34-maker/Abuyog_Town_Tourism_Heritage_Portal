<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class FaceVerificationService
{
    public function isConfigured(): bool
    {
        return config('services.face_service.enabled', false)
            && filled(config('services.face_service.url'))
            && filled(config('services.face_service.token'));
    }

    /**
     * @return array{embedding: list<float>, model: string}
     */
    public function enroll(string $image): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('The local face processing service is not configured.');
        }

        $response = Http::acceptJson()
            ->connectTimeout(3)
            ->timeout((int) config('services.face_service.timeout', 20))
            ->withToken((string) config('services.face_service.token'))
            ->post($this->endpoint('enroll'), [
                'image_base64' => base64_encode($image),
            ]);

        if ($response->failed()) {
            throw new RuntimeException('The local face processing service could not enroll this image.');
        }

        $payload = $response->json();
        $embedding = is_array($payload) ? ($payload['embedding'] ?? null) : null;
        $model = is_array($payload) ? ($payload['model'] ?? null) : null;

        if (! is_array($payload)
            || ($payload['face_detected'] ?? null) !== true
            || ! is_array($embedding)
            || $embedding === []
            || count($embedding) > 4096
            || ! is_string($model)
            || $model !== config('services.face_service.model', 'Facenet')) {
            throw new RuntimeException('The face processing service returned an invalid enrollment result.');
        }

        $normalizedEmbedding = [];

        foreach ($embedding as $value) {
            if (! is_numeric($value) || ! is_finite((float) $value)) {
                throw new RuntimeException('The face processing service returned an invalid enrollment result.');
            }

            $normalizedEmbedding[] = (float) $value;
        }

        return [
            'embedding' => $normalizedEmbedding,
            'model' => $model,
        ];
    }

    public function matchesLegacyReference(string $candidateImage, string $referenceImage): bool
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('The local face processing service is not configured.');
        }

        $response = Http::acceptJson()
            ->connectTimeout(3)
            ->timeout((int) config('services.face_service.timeout', 20))
            ->withToken((string) config('services.face_service.token'))
            ->post($this->endpoint('verify'), [
                'image1_base64' => base64_encode($candidateImage),
                'image2_base64' => base64_encode($referenceImage),
            ]);

        if ($response->failed()) {
            throw new RuntimeException('The local face processing service could not compare a stored enrollment.');
        }

        $payload = $response->json();

        if (! is_array($payload)
            || ($payload['comparison_succeeded'] ?? null) !== true
            || ($payload['face_detected'] ?? null) !== [true, true]
            || ! is_bool($payload['match'] ?? null)) {
            throw new RuntimeException('The face processing service returned an invalid comparison result.');
        }

        return $payload['match'];
    }

    private function endpoint(string $path): string
    {
        return rtrim((string) config('services.face_service.url'), '/').'/'.$path;
    }
}
