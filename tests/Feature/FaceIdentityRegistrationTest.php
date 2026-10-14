<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

function validLocalFaceUploadForRegistrationTest(): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        'face.jpg',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=', true),
    );
}

beforeEach(function (): void {
    config([
        'services.face_service.enabled' => true,
        'services.face_service.url' => 'http://127.0.0.1:8001',
        'services.face_service.token' => 'local-test-token',
    ]);
});

test('a new customer can enroll a face reference during registration', function () {
    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response([
            'face_detected' => true,
            'model' => 'Facenet',
            'embedding' => array_fill(0, 128, 0.1),
        ], 200),
    ]);

    $response = $this->post(route('register.store'), [
        'name' => 'Face Enrollment User',
        'email' => 'face.enrollment@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
        'face_biometric_consent' => true,
        'face_image' => validLocalFaceUploadForRegistrationTest(),
    ]);

    $response->assertRedirect(route('dashboard'));

    $user = User::query()->where('email', 'face.enrollment@example.com')->firstOrFail();
    expect($user->faceIdentity()->exists())->toBeTrue();
    expect($user->faceIdentity()->first()->embedding)->toHaveCount(128);
    expect($user->faceIdentity()->first()->reference_image)->toBeNull();
});

test('a duplicate face is rejected before creating a second account', function () {
    $existingUser = User::factory()->create();
    $existingUser->faceIdentity()->create([
        'face_id' => 'duplicate-face',
        'face_id_hash' => hash('sha256', 'duplicate-face'),
        'external_image_id' => 'duplicate-ext',
        'external_image_id_hash' => hash('sha256', 'duplicate-ext'),
        'reference_image' => 'reference-image',
        'consented_at' => now(),
    ]);

    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response([
            'face_detected' => true,
            'model' => 'Facenet',
            'embedding' => array_fill(0, 128, 0.1),
        ], 200),
        'http://127.0.0.1:8001/verify' => Http::response([
            'match' => true,
            'comparison_succeeded' => true,
            'face_detected' => [true, true],
        ], 200),
    ]);

    $this->post(route('register.store'), [
        'name' => 'Duplicate User',
        'email' => 'duplicate.user@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
        'face_biometric_consent' => true,
        'face_image' => validLocalFaceUploadForRegistrationTest(),
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'duplicate.user@example.com']);
});

test('a face embedding already enrolled in the local database is rejected', function () {
    $existingUser = User::factory()->create();
    $existingUser->faceIdentity()->create([
        'face_id' => 'duplicate-embedding',
        'face_id_hash' => hash('sha256', 'duplicate-embedding'),
        'external_image_id' => 'duplicate-embedding-ext',
        'external_image_id_hash' => hash('sha256', 'duplicate-embedding-ext'),
        'embedding' => array_fill(0, 128, 0.1),
        'consented_at' => now(),
    ]);

    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response([
            'face_detected' => true,
            'model' => 'Facenet',
            'embedding' => array_fill(0, 128, 0.1),
        ], 200),
    ]);

    $this->post(route('register.store'), [
        'name' => 'Duplicate Embedding User',
        'email' => 'duplicate.embedding@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
        'face_biometric_consent' => true,
        'face_image' => validLocalFaceUploadForRegistrationTest(),
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'duplicate.embedding@example.com']);
});

test('a user can withdraw consent and delete their enrolled face record', function () {
    $user = User::factory()->create();
    $user->faceIdentity()->create([
        'face_id' => 'remove-face',
        'face_id_hash' => hash('sha256', 'remove-face'),
        'external_image_id' => 'remove-ext',
        'external_image_id_hash' => hash('sha256', 'remove-ext'),
        'reference_image' => 'reference-image',
        'consented_at' => now(),
    ]);

    expect($user->faceIdentity()->exists())->toBeTrue();
    $this->actingAs($user)
        ->delete(route('profile.face-enrollment.destroy'))
        ->assertSessionHas('success', 'Your face data has been removed.');
    expect($user->fresh()->faceIdentity()->exists())->toBeFalse();
});

test('an unauthenticated visitor cannot remove an account face record', function () {
    $user = User::factory()->create();
    $identity = $user->faceIdentity()->create([
        'face_id' => 'protected-face',
        'face_id_hash' => hash('sha256', 'protected-face'),
        'external_image_id' => 'protected-ext',
        'external_image_id_hash' => hash('sha256', 'protected-ext'),
        'consented_at' => now(),
    ]);

    $this->delete(route('profile.face-enrollment.destroy'))
        ->assertRedirect(route('login'));

    $this->assertDatabaseHas('user_face_identities', [
        'id' => $identity->id,
        'user_id' => $user->id,
    ]);
});

test('deleting an account also deletes its face identity', function () {
    $user = User::factory()->create();
    $identity = $user->faceIdentity()->create([
        'face_id' => 'deleted-user-face',
        'face_id_hash' => hash('sha256', 'deleted-user-face'),
        'external_image_id' => 'deleted-user-ext',
        'external_image_id_hash' => hash('sha256', 'deleted-user-ext'),
        'consented_at' => now(),
    ]);

    $user->delete();

    $this->assertDatabaseMissing('user_face_identities', ['id' => $identity->id]);
});
