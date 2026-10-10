<?php

use App\Models\User;
use App\Services\FaceLivenessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('guests can view the login and registration pages', function () {
    $this->get(route('login'))->assertOk();
    $this->get(route('register'))->assertOk();
});

test('a visitor can register and is signed in', function () {
    $response = $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => '11111111-1111-4111-8111-111111111111',
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => now()->timestamp,
            ],
        ],
    ])->post(route('register.store'), [
        'name' => 'Andrae Dela Cruz',
        'email' => 'andrae@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', ['email' => 'andrae@example.com']);

    $registeredUser = User::where('email', 'andrae@example.com')->firstOrFail();
    expect(Hash::check('password', $registeredUser->password))->toBeTrue();
});

test('registration cannot be bypassed with a client-supplied verification flag', function () {
    $this->post(route('register.store'), [
        'name' => 'Unverified Visitor',
        'email' => 'unverified@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
        'face_verified' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'unverified@example.com']);
    $this->assertGuest();
});

test('local browser verification requires and validates a captured image without AWS configuration', function () {
    config([
        'services.face_liveness.region' => null,
        'services.face_liveness.identity_pool_id' => null,
    ]);

    $sessionId = 'browser-local-session';
    $challengeToken = 'browser-local-token';
    app(FaceLivenessService::class)->storeSessionChallenge($sessionId, $challengeToken);
    $imageContents = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=',
        true,
    );
    $capture = UploadedFile::fake()->createWithContent('face-capture.png', $imageContents);
    expect(Cache::get('registration.face-liveness.challenge.'.hash('sha256', $sessionId)))
        ->toBe(['challenge_token' => $challengeToken]);
    expect($capture->isValid())->toBeTrue();
    expect(getimagesize($capture->getRealPath()))->not->toBeFalse();

    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => $sessionId,
                'challenge_token' => $challengeToken,
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'), [
        'challenge_token' => $challengeToken,
        'capture' => $capture,
        'face_confidence' => 0.92,
        'face_count' => 1,
    ])->assertRedirect(route('register'));

    expect(session('registration.face_liveness.verified_at'))->toBeNumeric();

    $this->post(route('register.store'), [
        'name' => 'Local Browser User',
        'email' => 'browser-local@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('users', ['email' => 'browser-local@example.com']);
});

test('a browser verification flag without a captured image cannot authorize registration', function () {
    $sessionId = 'browser-missing-capture-session';
    $challengeToken = 'browser-missing-capture-token';
    app(FaceLivenessService::class)->storeSessionChallenge($sessionId, $challengeToken);

    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => $sessionId,
                'challenge_token' => $challengeToken,
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'), [
        'challenge_token' => $challengeToken,
        'verified' => true,
    ])->assertSessionHasErrors('capture');

    expect(session('registration.face_liveness.verified_at'))->toBeNull();
    $this->assertDatabaseCount('users', 0);
});

test('local browser verification rejects unsupported capture formats', function () {
    $sessionId = 'browser-invalid-capture-session';
    $challengeToken = 'browser-invalid-capture-token';
    app(FaceLivenessService::class)->storeSessionChallenge($sessionId, $challengeToken);

    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => $sessionId,
                'challenge_token' => $challengeToken,
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'), [
        'challenge_token' => $challengeToken,
        'capture' => UploadedFile::fake()->create('capture.gif', 100, 'image/gif'),
        'face_confidence' => 0.95,
        'face_count' => 1,
    ])->assertSessionHasErrors('capture');

    expect(session('registration.face_liveness.verified_at'))->toBeNull();
    $this->assertDatabaseCount('users', 0);
});

test('a local capture below the configured confidence threshold cannot verify registration', function () {
    config(['services.face_liveness.confidence_threshold' => 80]);
    $sessionId = 'browser-low-confidence-session';
    $challengeToken = 'browser-low-confidence-token';
    app(FaceLivenessService::class)->storeSessionChallenge($sessionId, $challengeToken);
    $imageContents = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=',
        true,
    );

    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => $sessionId,
                'challenge_token' => $challengeToken,
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'), [
        'challenge_token' => $challengeToken,
        'capture' => UploadedFile::fake()->createWithContent('low-confidence-capture.png', $imageContents),
        'face_confidence' => 0.79,
        'face_count' => 1,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseCount('users', 0);
});

test('a browser challenge can start without AWS configuration', function () {
    config([
        'services.face_liveness.region' => null,
        'services.face_liveness.identity_pool_id' => null,
    ]);

    $this->post(route('register.face-session'))
        ->assertRedirect(route('register'));

    $this->assertDatabaseCount('users', 0);
});

test('face verification redirects remain https behind a local tunnel proxy', function () {
    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '127.0.0.1',
        'HTTP_HOST' => 'verification-tunnel.example.test',
        'HTTP_X_FORWARDED_PROTO' => 'https',
    ])->post(route('register.face-session'));

    expect(parse_url($response->headers->get('Location'), PHP_URL_SCHEME))->toBe('https');
    expect(parse_url($response->headers->get('Location'), PHP_URL_PATH))->toBe('/register');
});

test('AWS session creation errors are hidden and registration remains blocked', function () {
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldReceive('hasBrowserConfiguration')->once()->andReturn(true);
    $faceLiveness->shouldReceive('createSession')->once()->andThrow(new RuntimeException('private AWS credential detail'));
    $this->instance(FaceLivenessService::class, $faceLiveness);

    $this->post(route('register.face-session'))
        ->assertSessionHasErrors([
            'face_verification' => 'Face verification is currently unavailable. Please try again later.',
        ])
        ->assertDontSee('private AWS credential detail');

    $this->post(route('register.store'), [
        'name' => 'Unverified Visitor',
        'email' => 'aws-error@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'aws-error@example.com']);
});

test('AWS result errors are hidden and verification remains unapproved', function () {
    config(['services.face_liveness.local_browser' => false]);
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldReceive('getSessionResults')
        ->once()
        ->andThrow(new RuntimeException('private AWS result detail'));
    $this->instance(FaceLivenessService::class, $faceLiveness);
    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => '11111111-1111-4111-8111-111111111111',
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'))
        ->assertSessionHasErrors([
            'face_verification' => 'Face verification is currently unavailable. Please try again later.',
        ])
        ->assertDontSee('private AWS result detail');

    $this->post(route('register.store'), [
        'name' => 'AWS Result Error',
        'email' => 'aws-result-error@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'aws-result-error@example.com']);
});

test('a successful server-verified liveness result permits registration', function () {
    config([
        'services.face_liveness.confidence_threshold' => 80,
        'services.face_liveness.local_browser' => false,
    ]);
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldReceive('getSessionResults')
        ->once()
        ->with('11111111-1111-4111-8111-111111111111')
        ->andReturn(['status' => 'SUCCEEDED', 'confidence' => 91.5, 'face_count' => 1]);
    $this->instance(FaceLivenessService::class, $faceLiveness);
    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => '11111111-1111-4111-8111-111111111111',
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'))->assertRedirect(route('register'));

    $this->post(route('register.store'), [
        'name' => 'Verified Visitor',
        'email' => 'verified@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('users', ['email' => 'verified@example.com']);
    $this->assertAuthenticated();
});

test('liveness with multiple detected faces cannot authorize registration', function () {
    config(['services.face_liveness.local_browser' => false]);
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldReceive('getSessionResults')
        ->once()
        ->andReturn(['status' => 'SUCCEEDED', 'confidence' => 99, 'face_count' => 2]);
    $this->instance(FaceLivenessService::class, $faceLiveness);
    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => '11111111-1111-4111-8111-111111111111',
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'))->assertSessionHasErrors('face_verification');

    $this->post(route('register.store'), [
        'name' => 'Multiple Faces',
        'email' => 'multiple@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'multiple@example.com']);
});

test('a failed liveness challenge cannot authorize registration', function () {
    config(['services.face_liveness.local_browser' => false]);
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldReceive('getSessionResults')
        ->once()
        ->andReturn(['status' => 'FAILED', 'confidence' => null, 'face_count' => 0]);
    $this->instance(FaceLivenessService::class, $faceLiveness);
    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => '11111111-1111-4111-8111-111111111111',
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'))->assertSessionHasErrors('face_verification');

    $this->post(route('register.store'), [
        'name' => 'Failed Liveness',
        'email' => 'failed-liveness@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'failed-liveness@example.com']);
});

test('a previously consumed liveness session cannot authorize another registration', function () {
    Cache::add(
        'registration.face-liveness.consumed.'.hash('sha256', '11111111-1111-4111-8111-111111111111'),
        true,
        now()->addMinutes(3),
    );
    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => '11111111-1111-4111-8111-111111111111',
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => now()->timestamp,
            ],
        ],
    ])->post(route('register.store'), [
        'name' => 'Reused Verification',
        'email' => 'reused@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'reused@example.com']);
});

test('an expired AWS liveness session cannot authorize verification or registration', function () {
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldNotReceive('getSessionResults');
    $this->instance(FaceLivenessService::class, $faceLiveness);
    $this->withSession([
        'registration' => [
            'face_liveness' => [
                'session_id' => '11111111-1111-4111-8111-111111111111',
                'expires_at' => now()->subSecond()->timestamp,
                'verified_at' => null,
            ],
        ],
    ])->post(route('register.face-verification'))
        ->assertSessionHasErrors('face_verification');

    $this->post(route('register.store'), [
        'name' => 'Expired Verification',
        'email' => 'expired@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'expired@example.com']);
});

test('a second registration request cannot reuse a successfully consumed verification', function () {
    $verificationState = [
        'registration' => [
            'face_liveness' => [
                'session_id' => '33333333-3333-4333-8333-333333333333',
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => now()->timestamp,
            ],
        ],
    ];

    $this->withSession($verificationState)->post(route('register.store'), [
        'name' => 'First Registration',
        'email' => 'first-use@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertRedirect(route('dashboard'));

    $this->post(route('logout'))->assertRedirect(route('home'));

    $this->withSession($verificationState)->post(route('register.store'), [
        'name' => 'Second Registration',
        'email' => 'second-use@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseHas('users', ['email' => 'first-use@example.com']);
    $this->assertDatabaseMissing('users', ['email' => 'second-use@example.com']);
});

test('a registered visitor can sign in and sign out', function () {
    $user = User::factory()->create([
        'email' => 'visitor@example.com',
        'password' => Hash::make('password'),
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($user);

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

    $this->get(route('profile'))
        ->assertInertia(fn ($page) => $page
            ->component('profile')
            ->where('auth.user.avatar', Storage::disk('public')->url($user->profile_photo_path)));
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
