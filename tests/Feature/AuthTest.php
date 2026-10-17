<?php

use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

function validFaceUploadForTests(): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        'face.jpg',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=', true),
    );
}

test('guests can view the login and registration pages', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/login')
            ->missing('faceVerification')
            ->missing('faceProcessing'));
    $this->get(route('register'))->assertOk();
});

test('registration requires explicit consent and a captured face image when local verification is enabled', function () {
    config([
        'services.face_service.enabled' => true,
        'services.face_service.url' => 'http://127.0.0.1:8001',
        'services.face_service.token' => 'local-test-token',
    ]);

    $this->post(route('register.store'), [
        'name' => 'Local User',
        'email' => 'local.user@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors(['face_biometric_consent', 'face_image']);

    $this->assertDatabaseMissing('users', ['email' => 'local.user@example.com']);
});

test('a visitor can register after local face processing and is signed in', function () {
    config([
        'services.face_service.enabled' => true,
        'services.face_service.url' => 'http://127.0.0.1:8001',
        'services.face_service.token' => 'local-test-token',
    ]);

    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response([
            'face_detected' => true,
            'model' => 'Facenet',
            'embedding' => array_fill(0, 128, 0.1),
        ], 200),
    ]);

    $response = $this->post(route('register.store'), [
        'name' => 'Andrae Dela Cruz',
        'email' => 'andrae@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
        'face_biometric_consent' => true,
        'face_image' => validFaceUploadForTests(),
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', ['email' => 'andrae@example.com']);
    $this->assertDatabaseHas('user_face_identities', [
        'user_id' => User::query()->where('email', 'andrae@example.com')->value('id'),
    ]);
});

test('registration allows a face that does not match a legacy enrollment', function () {
    config([
        'services.face_service.enabled' => true,
        'services.face_service.url' => 'http://127.0.0.1:8001',
        'services.face_service.token' => 'local-test-token',
    ]);

    $existingUser = User::factory()->create();
    $existingUser->faceIdentity()->create([
        'face_id' => 'existing-face',
        'face_id_hash' => hash('sha256', 'existing-face'),
        'external_image_id' => 'existing-ext',
        'external_image_id_hash' => hash('sha256', 'existing-ext'),
        'reference_image' => 'stored-enrolled-image',
        'consented_at' => now(),
    ]);

    Http::fake([
        'http://127.0.0.1:8001/enroll' => Http::response([
            'face_detected' => true,
            'model' => 'Facenet',
            'embedding' => array_fill(0, 128, 0.1),
        ], 200),
        'http://127.0.0.1:8001/verify' => Http::response([
            'match' => false,
            'comparison_succeeded' => true,
            'face_detected' => [true, true],
        ], 200),
    ]);

    $this->post(route('register.store'), [
        'name' => 'Distinct Face User',
        'email' => 'distinct.face@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
        'face_biometric_consent' => true,
        'face_image' => validFaceUploadForTests(),
    ])->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('users', ['email' => 'distinct.face@example.com']);
});

test('login works with email and password without an enrolled face or face-service call', function () {
    config([
        'services.face_service.enabled' => true,
        'services.face_service.url' => 'http://127.0.0.1:8001',
        'services.face_service.token' => 'local-test-token',
    ]);

    $user = User::factory()->create([
        'email' => 'login.face@example.com',
        'password' => Hash::make('password'),
    ]);

    Http::fake();

    $this->post(route('login.store'), [
        'email' => 'login.face@example.com',
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($user);
    Http::assertNothingSent();
});

test('login requests are rate limited', function () {
    foreach (range(1, 5) as $attempt) {
        $this->post(route('login.store'), [
            'email' => 'unknown@example.com',
            'password' => 'invalid-password',
        ])->assertRedirect();
    }

    $this->post(route('login.store'), [
        'email' => 'unknown@example.com',
        'password' => 'invalid-password',
    ])->assertTooManyRequests();
});

test('an existing user without biometric enrollment can sign in and sign out normally', function () {
    config([
        'services.face_service.enabled' => true,
        'services.face_service.url' => 'http://127.0.0.1:8001',
        'services.face_service.token' => 'local-test-token',
    ]);

    $user = User::factory()->create([
        'email' => 'visitor@example.com',
        'password' => Hash::make('password'),
    ]);

    Http::fake();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($user);
    Http::assertNothingSent();
    $this->post(route('logout'))->assertRedirect(route('home'));
    $this->assertGuest();
});

test('guests cannot access the dashboard or profile', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
    $this->get(route('profile'))->assertRedirect(route('login'));
});

test('the dashboard shows the authenticated user details', function () {
    $user = User::factory()->create([
        'name' => 'Abuyog Explorer',
        'email' => 'explorer@example.com',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('auth.user.name', 'Abuyog Explorer')
            ->where('auth.user.email', 'explorer@example.com'));
});

test('an authenticated user can update their profile', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Updated Explorer',
            'email' => 'updated@example.com',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Explorer',
        'email' => 'updated@example.com',
    ]);
});

test('an authenticated user can upload and retain a profile photo', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $imageContents = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=',
        true,
    );

    $this->actingAs($user)
        ->post(route('profile.update'), [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'profile_photo' => UploadedFile::fake()->createWithContent('profile.png', $imageContents),
        ])
        ->assertRedirect();

    $user->refresh();
    expect($user->profile_photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($user->profile_photo_path);
    expect($user->avatar)->toBe('/storage/'.$user->profile_photo_path);

    $this->get(route('profile'))
        ->assertInertia(fn ($page) => $page
            ->component('profile')
            ->where('auth.user.avatar', '/storage/'.$user->profile_photo_path));
});

test('all account roles can upload a profile photo on the shared profile page', function (string $role) {
    Storage::fake('public');
    $user = User::factory()->create(['role' => $role]);
    $imageContents = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=',
        true,
    );

    $this->actingAs($user)
        ->post(route('profile.update'), [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'profile_photo' => UploadedFile::fake()->createWithContent('profile.png', $imageContents),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $user->refresh();
    expect($user->profile_photo_path)->not->toBeNull()
        ->and($user->avatar)->toBe('/storage/'.$user->profile_photo_path);
    Storage::disk('public')->assertExists($user->profile_photo_path);
})->with([
    'customer' => 'user',
    'resort administrator' => 'resort_admin',
    'hotel administrator' => 'hotel_admin',
    'municipality administrator' => 'municipality_admin',
    'super administrator' => 'super_admin',
]);

test('a profile photo storage failure is shown without changing the saved profile', function () {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'profile_photo_path' => 'profile-photos/existing.jpg',
    ]);
    $disk = Mockery::mock(FilesystemAdapter::class);
    $disk->shouldReceive('putFile')
        ->once()
        ->with('profile-photos', Mockery::type(UploadedFile::class))
        ->andReturn(false);
    Storage::shouldReceive('disk')->once()->with('public')->andReturn($disk);
    $imageContents = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=',
        true,
    );

    $this->actingAs($user)
        ->post(route('profile.update'), [
            '_method' => 'patch',
            'name' => 'Changed Name',
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'profile_photo' => UploadedFile::fake()->createWithContent('profile.png', $imageContents),
        ])
        ->assertSessionHasErrors('profile_photo');

    expect($user->fresh()->name)->toBe('Original Name')
        ->and($user->fresh()->profile_photo_path)->toBe('profile-photos/existing.jpg');
});

test('an authenticated user cannot upload an unsupported profile photo', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'profile_photo' => UploadedFile::fake()->create('profile.gif', 100, 'image/gif'),
        ])
        ->assertSessionHasErrors('profile_photo');

    expect($user->fresh()->profile_photo_path)->toBeNull();
    Storage::disk('public')->assertDirectoryEmpty('profile-photos');
});
