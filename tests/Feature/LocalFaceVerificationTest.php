<?php

use App\Models\FaceIdentity;
use App\Models\User;
use App\Services\FaceIdentityService;
use App\Services\FaceVerificationService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

function successfulLocalEnrollmentPayload(): array
{
    return [
        'face_detected' => true,
        'model' => 'Facenet',
        'embedding' => array_fill(0, 128, 0.1),
    ];
}

function validFaceUploadForLocalVerificationTest(): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        'face.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=', true),
    );
}

function localRegistrationDataForVerificationTest(string $email): array
{
    return [
        'name' => 'Local Face User',
        'email' => $email,
        'contact_number' => '09171234567',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'terms' => true,
        'face_biometric_consent' => true,
        'face_image' => validFaceUploadForLocalVerificationTest(),
    ];
}

beforeEach(function (): void {
    config([
        'services.face_service.enabled' => true,
        'services.face_service.url' => 'http://127.0.0.1:8001',
        'services.face_service.token' => 'local-test-token',
        'services.face_service.timeout' => 10,
        'services.face_service.model' => 'Facenet',
        'services.face_service.distance_metric' => 'cosine',
        'services.face_service.threshold' => 0.40,
    ]);
});

test('local face service sends an authenticated single-image enrollment request', function (): void {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response(successfulLocalEnrollmentPayload(), 200),
    ]);

    $result = app(FaceVerificationService::class)->enroll('face-image-bytes');

    expect($result['model'])->toBe('Facenet')
        ->and($result['embedding'])->toHaveCount(128);

    Http::assertSent(fn ($request): bool => $request->url() === 'http://127.0.0.1:8001/enroll'
        && $request->hasHeader('Authorization', 'Bearer local-test-token')
        && $request['image_base64'] === base64_encode('face-image-bytes'));
});

test('registration requires consent and a face image before contacting the service', function (): void {
    Http::fake();

    $this->post(route('register.store'), [
        'name' => 'No Consent',
        'email' => 'no.consent@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'terms' => true,
        'face_image' => validFaceUploadForLocalVerificationTest(),
    ])->assertSessionHasErrors('face_biometric_consent');

    $this->assertDatabaseMissing('users', ['email' => 'no.consent@example.com']);
    Http::assertNothingSent();
});

test('registration rejects a missing face image', function (): void {
    Http::fake();

    $data = localRegistrationDataForVerificationTest('missing.image@example.com');
    unset($data['face_image']);

    $this->post(route('register.store'), $data)->assertSessionHasErrors('face_image');

    $this->assertDatabaseMissing('users', ['email' => 'missing.image@example.com']);
    Http::assertNothingSent();
});

test('registration rejects an invalid image before contacting the face service', function (): void {
    Http::fake();
    $data = localRegistrationDataForVerificationTest('invalid.image@example.com');
    $data['face_image'] = UploadedFile::fake()->create('not-an-image.txt', 20, 'text/plain');

    $this->post(route('register.store'), $data)->assertSessionHasErrors('face_image');

    $this->assertDatabaseMissing('users', ['email' => 'invalid.image@example.com']);
    Http::assertNothingSent();
});

test('a no-face response prevents registration and leaves no user behind', function (): void {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response(['detail' => 'A usable face could not be detected.'], 422),
    ]);

    $this->post(route('register.store'), localRegistrationDataForVerificationTest('no.face@example.com'))
        ->assertSessionHasErrors('face_verification');

    $this->assertGuest();
    $this->assertDatabaseMissing('users', ['email' => 'no.face@example.com']);
    $this->assertDatabaseCount('user_face_identities', 0);
});

test('an unavailable face service prevents registration', function (): void {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response(['detail' => 'Unavailable.'], 503),
    ]);

    $this->post(route('register.store'), localRegistrationDataForVerificationTest('service.down@example.com'))
        ->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'service.down@example.com']);
});

test('a face service timeout prevents registration', function (): void {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => fn () => throw new ConnectionException('Timed out.'),
    ]);

    $this->post(route('register.store'), localRegistrationDataForVerificationTest('service.timeout@example.com'))
        ->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'service.timeout@example.com']);
});

test('an invalid local service token response prevents registration', function (): void {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response(['detail' => 'Unauthorized.'], 401),
    ]);

    $this->post(route('register.store'), localRegistrationDataForVerificationTest('invalid.token@example.com'))
        ->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'invalid.token@example.com']);
});

test('an invalid service enrollment payload cannot create an account', function (): void {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response([
            'face_detected' => false,
            'model' => 'Facenet',
            'embedding' => array_fill(0, 128, 0.1),
        ], 200),
    ]);

    $this->post(route('register.store'), localRegistrationDataForVerificationTest('invalid.response@example.com'))
        ->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'invalid.response@example.com']);
});

test('a database enrollment failure rolls back the new account', function (): void {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response(successfulLocalEnrollmentPayload(), 200),
    ]);
    FaceIdentity::creating(static function (): void {
        throw new RuntimeException('Database enrollment failure.');
    });

    $this->post(route('register.store'), localRegistrationDataForVerificationTest('rollback@example.com'))
        ->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'rollback@example.com']);
});

test('face embeddings are excluded from profile responses and model arrays', function (): void {
    $user = User::factory()->create();
    $user->faceIdentity()->create([
        'face_id' => 'face-id',
        'face_id_hash' => hash('sha256', 'face-id'),
        'external_image_id' => 'external-image-id',
        'external_image_id_hash' => hash('sha256', 'external-image-id'),
        'embedding' => array_fill(0, 128, 0.1),
        'consented_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('profile'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('faceEnrollment.enrolled', true)
            ->missing('faceEnrollment.embedding')
            ->missing('faceEnrollment.reference_image'));

    expect($user->faceIdentity()->first()->toArray())
        ->not->toHaveKey('embedding')
        ->not->toHaveKey('reference_image');
});

test('blank face input cannot enroll a user', function (): void {
    $service = app(FaceIdentityService::class);
    $createUser = fn () => User::factory()->create();

    expect(fn () => $service->createUserWithEnrollment('', $createUser))
        ->toThrow(RuntimeException::class, 'A face image is required for registration.');
});
