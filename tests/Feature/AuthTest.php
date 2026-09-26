<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('guests can view the login and registration pages', function () {
    $this->get(route('login'))->assertOk();
    $this->get(route('register'))->assertOk();
});

test('a visitor can register and is signed in', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Andrae Dela Cruz',
        'email' => 'andrae@example.com',
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
