<?php

use App\Models\FaceIdentity;
use App\Models\User;
use App\Services\FaceLivenessService;
use App\Services\FaceRecognitionService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;

function configureFaceIdentityServicesForTest(
    string $sessionId,
    string $image,
    array $matches = [],
    string $faceId = 'aws-face-id',
    bool $index = true,
    bool $performSearch = true,
): void {
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldReceive('hasVerifiedReferenceImage')->with($sessionId)->andReturn(true);
    $faceLiveness->shouldReceive('consumeVerifiedReferenceImage')->with($sessionId)->andReturn($image);
    app()->instance(FaceLivenessService::class, $faceLiveness);

    $faceRecognition = Mockery::mock(FaceRecognitionService::class);
    if ($performSearch) {
        $faceRecognition->shouldReceive('search')->with($image)->andReturn($matches);
    } else {
        $faceRecognition->shouldNotReceive('search');
    }

    if ($matches === [] && $index) {
        $faceRecognition->shouldReceive('index')
            ->with($image, Mockery::type('string'))
            ->andReturn($faceId);
    } else {
        $faceRecognition->shouldNotReceive('index');
    }

    app()->instance(FaceRecognitionService::class, $faceRecognition);
}

function faceSessionForIdentityTest(string $sessionId): array
{
    return [
        'registration' => [
            'face_liveness' => [
                'session_id' => $sessionId,
                'expires_at' => now()->addMinutes(2)->timestamp,
                'verified_at' => now()->timestamp,
                'consent' => true,
            ],
        ],
    ];
}

function registrationFormForIdentityTest(string $email, string $name = 'Face Identity User'): array
{
    return [
        'name' => $name,
        'email' => $email,
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
        'face_biometric_consent' => true,
    ];
}

function createEnrolledCustomerForIdentityTest(
    TestCase $test,
    string $email,
    string $image,
    string $sessionId = 'first-session',
): User {
    configureFaceIdentityServicesForTest($sessionId, $image, [], 'face-for-'.$email);

    $test->withSession(faceSessionForIdentityTest($sessionId))
        ->post(route('register.store'), registrationFormForIdentityTest($email))
        ->assertRedirect(route('dashboard'));
    $test->post(route('logout'));

    return User::query()->where('email', $email)->firstOrFail();
}

test('the same enrolled person cannot register again with a different email', function () {
    $existingUser = createEnrolledCustomerForIdentityTest($this, 'first.person@example.com', 'same-person-image');
    $identity = $existingUser->faceIdentity()->firstOrFail();
    $sessionId = 'second-email-session';

    configureFaceIdentityServicesForTest($sessionId, 'same-person-image', [[
        'face_id' => $identity->face_id,
        'external_image_id' => $identity->external_image_id,
        'similarity' => 99.8,
    ]]);

    $this->withSession(faceSessionForIdentityTest($sessionId))
        ->post(route('register.store'), registrationFormForIdentityTest('different.email@example.com'))
        ->assertSessionHasErrors([
            'face_verification' => 'An account associated with this face already exists. Please log in to your existing account.',
        ]);

    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseMissing('users', ['email' => 'different.email@example.com']);
    expect(session('errors')->getBag('default')->first('face_verification'))
        ->not->toContain('first.person@example.com', (string) $existingUser->id);
});

test('a different Facebook account with a matching face cannot register a second account', function () {
    $existingUser = createEnrolledCustomerForIdentityTest($this, 'existing.face@example.com', 'facebook-matching-face');
    $identity = $existingUser->faceIdentity()->firstOrFail();
    config(['services.facebook' => [
        'client_id' => 'test-client-id',
        'client_secret' => 'test-client-secret',
        'redirect' => 'http://localhost/auth/facebook/callback',
    ]]);

    $facebookUser = new class
    {
        public function getId(): string
        {
            return 'different-facebook-id';
        }

        public function getName(): string
        {
            return 'Different Facebook Person';
        }

        public function getEmail(): string
        {
            return 'different.facebook@example.com';
        }
    };
    $provider = Mockery::mock();
    $provider->shouldReceive('user')->once()->andReturn($facebookUser);
    Socialite::shouldReceive('driver')->with('facebook')->once()->andReturn($provider);

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('register'))
        ->assertSessionHas('pending_facebook_signup.facebook_id', 'different-facebook-id');

    $sessionId = 'facebook-face-session';
    configureFaceIdentityServicesForTest($sessionId, 'facebook-matching-face', [[
        'face_id' => $identity->face_id,
        'external_image_id' => $identity->external_image_id,
        'similarity' => 99.3,
    ]]);

    $this->withSession([
        ...faceSessionForIdentityTest($sessionId),
        'pending_facebook_signup' => [
            'name' => 'Different Facebook Person',
            'email' => 'different.facebook@example.com',
            'facebook_id' => 'different-facebook-id',
        ],
    ])->post(route('register.store'), [
        'name' => 'Different Facebook Person',
        'email' => 'different.facebook@example.com',
        'contact_number' => '09170000000',
        'terms' => true,
        'face_biometric_consent' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseMissing('users', ['facebook_id' => 'different-facebook-id']);
});

test('two different people can register with different face identities', function () {
    $first = createEnrolledCustomerForIdentityTest($this, 'first.person@example.com', 'first-person-image');
    $secondSessionId = 'second-person-session';
    configureFaceIdentityServicesForTest($secondSessionId, 'second-person-image', [], 'second-person-face');

    $this->withSession(faceSessionForIdentityTest($secondSessionId))
        ->post(route('register.store'), registrationFormForIdentityTest('second.person@example.com', 'Second Person'))
        ->assertRedirect(route('dashboard'));

    $this->assertDatabaseCount('users', 2);
    expect($first->faceIdentity()->exists())->toBeTrue();
    expect(User::query()->where('email', 'second.person@example.com')->firstOrFail()->faceIdentity()->exists())
        ->toBeTrue();
});

test('an existing customer can opt in to liveness-verified face enrollment', function () {
    $user = User::factory()->create(['role' => 'user']);
    $faceLiveness = Mockery::mock(FaceLivenessService::class);
    $faceLiveness->shouldReceive('hasBrowserConfiguration')->andReturn(true);
    $faceLiveness->shouldReceive('createSession')->once()->andReturn('optional-enrollment-session');
    $faceLiveness->shouldReceive('storeVerifiedReferenceImage')
        ->once()
        ->with('optional-enrollment-session')
        ->andReturn(['status' => 'SUCCEEDED', 'confidence' => 98]);
    $faceLiveness->shouldReceive('consumeVerifiedReferenceImage')
        ->once()
        ->with('optional-enrollment-session')
        ->andReturn('optional-enrollment-image');
    app()->instance(FaceLivenessService::class, $faceLiveness);

    $faceRecognition = Mockery::mock(FaceRecognitionService::class);
    $faceRecognition->shouldReceive('isConfigured')->andReturn(true);
    $faceRecognition->shouldReceive('search')->with('optional-enrollment-image')->andReturn([]);
    $faceRecognition->shouldReceive('index')
        ->with('optional-enrollment-image', Mockery::type('string'))
        ->andReturn('optional-enrollment-face-id');
    app()->instance(FaceRecognitionService::class, $faceRecognition);

    $this->actingAs($user)
        ->post(route('profile.face-enrollment.session'), ['consent' => true])
        ->assertRedirect();

    $this->post(route('profile.face-enrollment.complete'))
        ->assertRedirect()
        ->assertSessionHas('success', 'Your face identity has been enrolled.');

    $this->assertDatabaseHas('user_face_identities', ['user_id' => $user->id]);
});

test('an uncertain face match blocks signup without disclosing account details', function () {
    $existingUser = createEnrolledCustomerForIdentityTest($this, 'private.person@example.com', 'possibly-matching-image');
    $identity = $existingUser->faceIdentity()->firstOrFail();
    $sessionId = 'uncertain-match-session';

    configureFaceIdentityServicesForTest($sessionId, 'possibly-matching-image', [[
        'face_id' => $identity->face_id,
        'external_image_id' => $identity->external_image_id,
        'similarity' => 95.5,
    ]]);

    $this->withSession(faceSessionForIdentityTest($sessionId))
        ->post(route('register.store'), registrationFormForIdentityTest('uncertain.person@example.com'))
        ->assertSessionHasErrors([
            'face_verification' => 'We could not confidently verify this face. Please contact the site administrator for assistance.',
        ]);

    $this->assertDatabaseCount('users', 1);
    expect(session('errors')->getBag('default')->first('face_verification'))
        ->not->toContain('private.person@example.com', (string) $existingUser->id);
});

test('a failed recognition request never creates an account', function () {
    $sessionId = 'failed-recognition-session';
    configureFaceIdentityServicesForTest(
        $sessionId,
        'recognition-failure-image',
        index: false,
        performSearch: false,
    );
    $faceRecognition = Mockery::mock(FaceRecognitionService::class);
    $faceRecognition->shouldReceive('search')
        ->with('recognition-failure-image')
        ->once()
        ->andThrow(new RuntimeException('private AWS service detail'));
    app()->instance(FaceRecognitionService::class, $faceRecognition);

    $this->withSession(faceSessionForIdentityTest($sessionId))
        ->post(route('register.store'), registrationFormForIdentityTest('recognition-failure@example.com'))
        ->assertSessionHasErrors('face_verification')
        ->assertDontSee('private AWS service detail');

    $this->assertDatabaseMissing('users', ['email' => 'recognition-failure@example.com']);
});

test('a concurrent registration fails closed while another identity check owns the registry lock', function () {
    $sessionId = 'contended-registration-session';
    configureFaceIdentityServicesForTest(
        $sessionId,
        'contended-image',
        index: false,
        performSearch: false,
    );
    $lock = Cache::lock('face-identity-registration', 120);
    expect($lock->get())->toBeTrue();

    try {
        $this->withSession(faceSessionForIdentityTest($sessionId))
            ->post(route('register.store'), registrationFormForIdentityTest('contended@example.com'))
            ->assertSessionHasErrors('face_verification');
    } finally {
        $lock->release();
    }

    $this->assertDatabaseMissing('users', ['email' => 'contended@example.com']);
});

test('removing an enrolled face identity deletes its AWS record before local deletion', function () {
    $user = User::factory()->create();
    $identity = FaceIdentity::query()->create([
        'user_id' => $user->id,
        'face_id' => 'face-to-delete',
        'face_id_hash' => hash('sha256', 'face-to-delete'),
        'external_image_id' => 'external-id-to-delete',
        'external_image_id_hash' => hash('sha256', 'external-id-to-delete'),
        'consented_at' => now(),
    ]);
    $storedIdentity = DB::table('user_face_identities')
        ->where('id', $identity->id)
        ->first();
    expect($storedIdentity->face_id)->not->toBe('face-to-delete')
        ->and($storedIdentity->external_image_id)->not->toBe('external-id-to-delete');
    $recognition = Mockery::mock(FaceRecognitionService::class);
    $recognition->shouldReceive('delete')->once()->with('face-to-delete');
    app()->instance(FaceRecognitionService::class, $recognition);

    $this->actingAs($user)
        ->delete(route('profile.face-enrollment.destroy'))
        ->assertRedirect()
        ->assertSessionHas('success', 'Your face identity has been removed.');

    $this->assertDatabaseMissing('user_face_identities', ['id' => $identity->id]);
});

test('deleting a customer account removes its AWS face template', function () {
    $user = User::factory()->create();
    FaceIdentity::query()->create([
        'user_id' => $user->id,
        'face_id' => 'face-for-deleted-account',
        'face_id_hash' => hash('sha256', 'face-for-deleted-account'),
        'external_image_id' => 'external-id-for-deleted-account',
        'external_image_id_hash' => hash('sha256', 'external-id-for-deleted-account'),
        'consented_at' => now(),
    ]);
    $recognition = Mockery::mock(FaceRecognitionService::class);
    $recognition->shouldReceive('delete')->once()->with('face-for-deleted-account');
    app()->instance(FaceRecognitionService::class, $recognition);

    $user->delete();

    $this->assertDatabaseMissing('user_face_identities', ['user_id' => $user->id]);
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('administrators cannot enroll customer face identities', function () {
    $user = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($user)
        ->post(route('profile.face-enrollment.session'), ['consent' => true])
        ->assertForbidden();
});
