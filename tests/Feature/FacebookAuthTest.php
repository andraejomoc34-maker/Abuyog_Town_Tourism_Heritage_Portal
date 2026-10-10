<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpFoundation\RedirectResponse;

function configureFacebookOAuthForTest(): void
{
    config(['services.facebook' => [
        'client_id' => 'test-facebook-client-id',
        'client_secret' => 'test-facebook-client-secret',
        'redirect' => 'http://localhost:8000/auth/facebook/callback',
    ]]);
}

function fakeFacebookProfileForTest(string $id, ?string $email, string $name = 'Facebook User'): object
{
    return new class($id, $email, $name)
    {
        public function __construct(
            private string $id,
            private ?string $email,
            private string $name,
        ) {}

        public function getId(): string
        {
            return $this->id;
        }

        public function getName(): string
        {
            return $this->name;
        }

        public function getEmail(): ?string
        {
            return $this->email;
        }
    };
}

function mockFacebookCallbackForTest(object $facebookUser): void
{
    $provider = Mockery::mock();
    $provider->shouldReceive('user')->once()->andReturn($facebookUser);
    Socialite::shouldReceive('driver')
        ->with('facebook')
        ->once()
        ->andReturn($provider);
}

it('registers the expected stateful Facebook OAuth redirect and minimum scopes', function () {
    configureFacebookOAuthForTest();
    $provider = Mockery::mock();
    $provider->shouldReceive('scopes')
        ->with(['email', 'public_profile'])
        ->once()
        ->andReturnSelf();
    $provider->shouldReceive('redirect')
        ->once()
        ->andReturn(new RedirectResponse('https://www.facebook.com/dialog/oauth'));
    Socialite::shouldReceive('driver')->with('facebook')->once()->andReturn($provider);

    expect(route('auth.facebook.redirect'))->toBe(url('/auth/facebook/redirect'));
    expect(route('auth.facebook.callback'))->toBe(url('/auth/facebook/callback'));

    $this->get(route('auth.facebook.redirect'))
        ->assertRedirect('https://www.facebook.com/dialog/oauth');
});

it('sends the configured callback URI and state in the real Socialite redirect', function () {
    configureFacebookOAuthForTest();

    $response = $this->get(route('auth.facebook.redirect'));
    $redirectUrl = $response->headers->get('Location');
    parse_str((string) parse_url($redirectUrl, PHP_URL_QUERY), $parameters);

    expect($response->status())->toBe(302);
    expect($parameters['redirect_uri'] ?? null)
        ->toBe(config('services.facebook.redirect'));
    expect($parameters['state'] ?? null)->not->toBeEmpty();
});

it('returns a clear login error when Facebook OAuth is not configured', function () {
    config(['services.facebook' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
    ]]);

    $this->get(route('auth.facebook.redirect'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');
});

it('handles a cancelled Facebook authorization without calling the provider', function () {
    configureFacebookOAuthForTest();

    $this->get(route('auth.facebook.callback', ['error' => 'access_denied']))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('rejects an invalid Facebook OAuth state', function () {
    configureFacebookOAuthForTest();
    $provider = Mockery::mock();
    $provider->shouldReceive('user')->once()->andThrow(new InvalidStateException);
    Socialite::shouldReceive('driver')->with('facebook')->once()->andReturn($provider);

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('handles Facebook provider failures without exposing provider details', function () {
    configureFacebookOAuthForTest();
    $provider = Mockery::mock();
    $provider->shouldReceive('user')
        ->once()
        ->andThrow(new RuntimeException('provider response included sensitive details'));
    Socialite::shouldReceive('driver')->with('facebook')->once()->andReturn($provider);

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    expect(session('errors')->getBag('default')->first('email'))
        ->not->toContain('sensitive details');
    $this->assertGuest();
});

it('stages a new Facebook user until face verification and registration succeed', function () {
    configureFacebookOAuthForTest();
    mockFacebookCallbackForTest(fakeFacebookProfileForTest('fb-123', 'facebook.user@example.com'));

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('register'))
        ->assertSessionHas('pending_facebook_signup.email', 'facebook.user@example.com');

    $this->assertDatabaseMissing('users', ['email' => 'facebook.user@example.com']);
    $this->assertGuest();

    $this->post(route('register.store'), [
        'name' => 'Facebook User',
        'email' => 'facebook.user@example.com',
        'contact_number' => '09171234567',
        'terms' => true,
    ])->assertSessionHasErrors('face_verification');

    $this->assertDatabaseMissing('users', ['email' => 'facebook.user@example.com']);
});

it('creates a staged Facebook user only after server-verified liveness', function () {
    configureFacebookOAuthForTest();
    mockFacebookCallbackForTest(fakeFacebookProfileForTest(
        'fb-789',
        'verified.facebook@example.com',
        'Verified Facebook User',
    ));

    $this->get(route('auth.facebook.callback'))->assertRedirect(route('register'));
    $this->post(route('register.face-session'))->assertRedirect(route('register'));
    $challengeToken = session('registration.face_liveness.challenge_token');
    $imageContents = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=',
        true,
    );

    $this->post(route('register.face-verification'), [
        'challenge_token' => $challengeToken,
        'capture' => UploadedFile::fake()->createWithContent('verified-face-capture.png', $imageContents),
        'face_confidence' => 0.95,
        'face_count' => 1,
    ])->assertRedirect(route('register'));

    $this->post(route('register.store'), [
        'name' => 'Verified Facebook User',
        'email' => 'verified.facebook@example.com',
        'contact_number' => '09171234567',
        'terms' => true,
    ])->assertRedirect(route('dashboard'));

    $user = User::query()->where('email', 'verified.facebook@example.com')->firstOrFail();
    expect($user->facebook_id)->toBe('fb-789');
    expect($user->role)->toBe('user');
    $this->assertAuthenticatedAs($user);
});

it('does not link Facebook to an existing email and password account', function () {
    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'role' => 'user',
    ]);
    $originalPassword = $user->password;
    configureFacebookOAuthForTest();
    mockFacebookCallbackForTest(fakeFacebookProfileForTest('fb-456', 'existing@example.com', 'Changed Name'));

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
    expect(User::query()->where('email', 'existing@example.com')->count())->toBe(1);
    expect($user->fresh()->facebook_id)->toBeNull();
    expect($user->fresh()->name)->toBe($user->name);
    expect($user->fresh()->password)->toBe($originalPassword);
});

it('allows missing Facebook email to be supplied through normal customer registration', function () {
    configureFacebookOAuthForTest();
    mockFacebookCallbackForTest(fakeFacebookProfileForTest('fb-no-email', null, 'No Email User'));

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('register'))
        ->assertSessionHas('pending_facebook_signup.facebook_id', 'fb-no-email');

    $this->get(route('register'))
        ->assertInertia(fn ($page) => $page
            ->component('auth/register')
            ->where('pendingFacebookSignup.email', null));

    $this->post(route('register.face-session'))
        ->assertRedirect(route('register'))
        ->assertSessionHas('pending_facebook_signup.facebook_id', 'fb-no-email');

    $challengeToken = session('registration.face_liveness.challenge_token');
    expect($challengeToken)->toBeString()->not->toBeEmpty();
    $imageContents = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l0cAAAAASUVORK5CYII=',
        true,
    );

    $this->post(route('register.face-verification'), [
        'challenge_token' => $challengeToken,
        'capture' => UploadedFile::fake()->createWithContent('facebook-face-capture.png', $imageContents),
        'face_confidence' => 0.92,
        'face_count' => 1,
    ])->assertRedirect(route('register'))
        ->assertSessionHas('pending_facebook_signup.facebook_id', 'fb-no-email');

    $this->post(route('register.store'), [
        'name' => 'No Email User',
        'email' => 'supplied.email@example.com',
        'terms' => true,
    ])->assertSessionHasErrors('contact_number');

    $this->assertDatabaseMissing('users', ['facebook_id' => 'fb-no-email']);
    expect(session('pending_facebook_signup.facebook_id'))->toBe('fb-no-email');

    $this->post(route('register.store'), [
        'name' => 'No Email User',
        'email' => 'supplied.email@example.com',
        'contact_number' => '09171234567',
        'facebook_id' => 'browser-supplied-fake-id',
        'terms' => true,
    ])->assertRedirect(route('dashboard'));

    $user = User::query()->where('facebook_id', 'fb-no-email')->firstOrFail();
    expect($user->email)->toBe('supplied.email@example.com');
    expect($user->role)->toBe('user');
    $this->assertAuthenticatedAs($user);
});

it('logs in only an existing account with the matching Facebook id without overwriting profile data', function () {
    $user = User::factory()->create([
        'name' => 'Saved Customer Name',
        'email' => 'saved.customer@example.com',
        'contact_number' => '09170000000',
        'facebook_id' => 'fb-stable-id',
        'facebook_avatar' => 'https://example.test/saved-avatar.jpg',
        'role' => 'user',
    ]);
    configureFacebookOAuthForTest();
    mockFacebookCallbackForTest(fakeFacebookProfileForTest(
        'fb-stable-id',
        'different@example.com',
        'Provider Changed Name',
    ));

    $this->get(route('auth.facebook.callback'))->assertRedirect(route('dashboard'));

    expect($user->fresh()->name)->toBe('Saved Customer Name');
    expect($user->fresh()->email)->toBe('saved.customer@example.com');
    expect($user->fresh()->facebook_avatar)->toBe('https://example.test/saved-avatar.jpg');
    $this->assertAuthenticatedAs($user);
});

it('does not allow a Facebook identity to authenticate an administrator account', function () {
    User::factory()->create([
        'email' => 'admin@example.com',
        'role' => 'super_admin',
        'facebook_id' => 'fb-admin-id',
        'contact_number' => '09170000001',
    ]);
    configureFacebookOAuthForTest();
    mockFacebookCallbackForTest(fakeFacebookProfileForTest('fb-admin-id', 'admin@example.com'));

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('does not authenticate a disabled Facebook customer', function () {
    User::factory()->create([
        'email' => 'disabled@example.com',
        'role' => 'user',
        'facebook_id' => 'fb-disabled-id',
        'is_active' => false,
        'contact_number' => '09170000002',
    ]);
    configureFacebookOAuthForTest();
    mockFacebookCallbackForTest(fakeFacebookProfileForTest('fb-disabled-id', 'disabled@example.com'));

    $this->get(route('auth.facebook.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});
