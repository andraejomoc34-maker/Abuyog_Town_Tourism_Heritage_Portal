<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

it('creates a new Facebook user as a normal user and logs them in', function () {
    Socialite::shouldReceive('driver')->with('facebook')->andReturnSelf();
    Socialite::shouldReceive('stateless')->andReturnSelf();
    Socialite::shouldReceive('user')->andReturn(new class
    {
        public function getId(): string
        {
            return 'fb-123';
        }

        public function getName(): string
        {
            return 'Facebook User';
        }

        public function getEmail(): ?string
        {
            return 'facebook.user@example.com';
        }

        public function getAvatar(): ?string
        {
            return 'https://graph.facebook.com/fb-123/picture';
        }
    });

    $this->get('/auth/facebook/callback')
        ->assertRedirect('/auth/complete-profile');

    $this->assertDatabaseHas('users', [
        'email' => 'facebook.user@example.com',
        'role' => 'user',
        'facebook_id' => 'fb-123',
    ]);

    $this->assertAuthenticated();
});

it('associates Facebook login with an existing email/password account without duplicating it', function () {
    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'role' => 'user',
    ]);

    Socialite::shouldReceive('driver')->with('facebook')->andReturnSelf();
    Socialite::shouldReceive('stateless')->andReturnSelf();
    Socialite::shouldReceive('user')->andReturn(new class
    {
        public function getId(): string
        {
            return 'fb-456';
        }

        public function getName(): string
        {
            return 'Existing User';
        }

        public function getEmail(): ?string
        {
            return 'existing@example.com';
        }

        public function getAvatar(): ?string
        {
            return 'https://graph.facebook.com/fb-456/picture';
        }
    });

    $this->get('/auth/facebook/callback')->assertRedirect('/auth/complete-profile');

    $this->assertSame(1, User::query()->where('email', 'existing@example.com')->count());
    $this->assertTrue(User::query()->where('email', 'existing@example.com')->first()->facebook_id === 'fb-456');
    $this->assertAuthenticatedAs($user);
});
