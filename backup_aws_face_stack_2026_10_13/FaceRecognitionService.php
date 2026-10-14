<?php

namespace App\Services;

use Aws\Rekognition\RekognitionClient;
use RuntimeException;

class FaceRecognitionService
{
    public function isConfigured(): bool
    {
        $matchThreshold = (float) config('services.face_recognition.match_threshold', 99);
        $uncertainThreshold = (float) config('services.face_recognition.uncertain_threshold', 90);

        return filled(config('services.face_liveness.region'))
            && filled(config('services.face_recognition.collection_id'))
            && $uncertainThreshold >= 90
            && $uncertainThreshold <= 100
            && $matchThreshold >= max(95, $uncertainThreshold)
            && $matchThreshold <= 100;
    }

    /**
     * @return list<array{face_id: string, external_image_id: string, similarity: float}>
     */
    public function search(string $image): array
    {
        $matches = $this->client()->searchFacesByImage([
            'CollectionId' => (string) config('services.face_recognition.collection_id'),
            'FaceMatchThreshold' => (float) config('services.face_recognition.uncertain_threshold', 90),
            'Image' => ['Bytes' => $image],
            'MaxFaces' => 5,
        ])->get('FaceMatches') ?? [];

        $results = [];

        foreach ($matches as $match) {
            $face = $match['Face'] ?? [];
            $faceId = $face['FaceId'] ?? null;
            $externalImageId = $face['ExternalImageId'] ?? null;
            $similarity = $match['Similarity'] ?? null;

            if (! is_string($faceId)
                || ! is_string($externalImageId)
                || ! is_numeric($similarity)) {
                throw new RuntimeException('Amazon Rekognition returned an incomplete face match.');
            }

            $results[] = [
                'face_id' => $faceId,
                'external_image_id' => $externalImageId,
                'similarity' => (float) $similarity,
            ];
        }

        return $results;
    }

    public function index(string $image, string $externalImageId): string
    {
        $faces = $this->client()->indexFaces([
            'CollectionId' => (string) config('services.face_recognition.collection_id'),
            'ExternalImageId' => $externalImageId,
            'Image' => ['Bytes' => $image],
            'MaxFaces' => 2,
            'QualityFilter' => 'HIGH',
        ])->get('FaceRecords') ?? [];

        if (count($faces) !== 1 || ! is_string($faces[0]['Face']['FaceId'] ?? null)) {
            throw new RuntimeException('Amazon Rekognition could not enroll exactly one face.');
        }

        return $faces[0]['Face']['FaceId'];
    }

    public function delete(string $faceId): void
    {
        $this->client()->deleteFaces([
            'CollectionId' => (string) config('services.face_recognition.collection_id'),
            'FaceIds' => [$faceId],
        ]);
    }

    private function client(): RekognitionClient
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Amazon Rekognition face recognition is not configured.');
        }

        return new RekognitionClient([
            'version' => 'latest',
            'region' => config('services.face_liveness.region'),
        ]);
    }
}
