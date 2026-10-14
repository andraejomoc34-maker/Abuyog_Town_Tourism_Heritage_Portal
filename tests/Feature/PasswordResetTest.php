<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

test('guests can view both password reset forms', function () {
    $this->get(route('password.request'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/forgot-password')
            ->where('status', null));

    $this->get(route('password.reset', [
        'token' => 'example-token',
        'email' => 'explorer@example.com',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/reset-password')
            ->where('token', 'example-token')
            ->where('email', 'explorer@example.com'));
});

test('reset link requests validate email and give the same response for known and unknown addresses', function () {
    Notification::fake();
    $user = User::factory()->create(['email' => 'explorer@example.com']);
    $notice = 'If an account exists for that email address, a reset email may arrive shortly. If one does not arrive, please wait a minute before trying again.';

    $this->post(route('password.email'), ['email' => 'not-an-email'])
        ->assertSessionHasErrors('email');

    foreach ([$user->email, 'unknown@example.com'] as $email) {
        $this->post(route('password.email'), ['email' => $email])
            ->assertRedirect(route('password.request'))
            ->assertSessionHas('status', $notice);
    }

    Notification::assertSentTo($user, ResetPassword::class);
    $this->assertDatabaseCount('password_reset_tokens', 1);
});

test('reset link requests are throttled by the password broker and request middleware', function () {
    Notification::fake();
    $user = User::factory()->create();
    $notice = 'If an account exists for that email address, a reset email may arrive shortly. If one does not arrive, please wait a minute before trying again.';

    foreach (range(1, 2) as $_) {
        $this->post(route('password.email'), ['email' => $user->email])
            ->assertRedirect(route('password.request'))
            ->assertSessionHas('status', $notice);
    }

    Notification::assertSentToTimes($user, ResetPassword::class, 1);

    for ($attempt = 0; $attempt < 3; $attempt++) {
        $this->post(route('password.email'), ['email' => 'unknown@example.com'])
            ->assertRedirect(route('password.request'));
    }

    $this->post(route('password.email'), ['email' => 'another@example.com'])
        ->assertTooManyRequests();
});

test('reset links are not sent through the log mailer', function () {
    config(['mail.default' => 'log']);
    $user = User::factory()->create();

    $this->from(route('password.request'))
        ->post(route('password.email'), ['email' => $user->email])
        ->assertRedirect(route('password.request'))
        ->assertSessionHasErrors('email');

    $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
});

test('reset submissions reject invalid and expired tokens', function () {
    $user = User::factory()->create();
    $originalPassword = $user->password;

    $this->post(route('password.update'), [
        'email' => $user->email,
        'token' => 'invalid-token',
        'password' => 'NewSecurePassword123!',
        'password_confirmation' => 'NewSecurePassword123!',
    ])->assertSessionHasErrors('email');

    $expiredToken = Password::createToken($user);
    DB::table('password_reset_tokens')
        ->where('email', $user->email)
        ->update(['created_at' => now()->subMinutes(61)]);

    $this->post(route('password.update'), [
        'email' => $user->email,
        'token' => $expiredToken,
        'password' => 'NewSecurePassword123!',
        'password_confirmation' => 'NewSecurePassword123!',
    ])->assertSessionHasErrors('email');

    expect($user->fresh()->password)->toBe($originalPassword);
});

test('password reset validates confirmation and consumes a successful token', function () {
    $user = User::factory()->create([
        'email' => 'explorer@example.com',
        'password' => Hash::make('OldSecurePassword123!'),
    ]);
    $token = Password::createToken($user);
    $newPassword = 'NewSecurePassword123!';

    $this->post(route('password.update'), [
        'email' => $user->email,
        'token' => $token,
        'password' => $newPassword,
        'password_confirmation' => 'DifferentPassword123!',
    ])->assertSessionHasErrors('password');

    $this->post(route('password.update'), [
        'email' => $user->email,
        'token' => $token,
        'password' => $newPassword,
        'password_confirmation' => $newPassword,
    ])
        ->assertRedirect(route('login'))
        ->assertSessionHas('status', 'Your password has been reset. You can now sign in.');

    expect(Hash::check($newPassword, $user->fresh()->password))->toBeTrue();
    $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);

    $this->post(route('password.update'), [
        'email' => $user->email,
        'token' => $token,
        'password' => $newPassword,
        'password_confirmation' => $newPassword,
    ])->assertSessionHasErrors('email');

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => $newPassword,
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($user);
});
