<?php

use App\Models\Feedback;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('stores guest feedback as pending', function () {
    $this->from('/')
        ->post('/feedback', [
            'name' => 'A Visitor',
            'email' => 'visitor@example.com',
            'rating' => 5,
            'message' => 'I enjoyed exploring Abuyog.',
        ])
        ->assertRedirect('/')
        ->assertSessionHas('success', 'Thank you for your feedback!');

    $this->assertDatabaseHas('feedback', [
        'user_id' => null,
        'name' => 'A Visitor',
        'email' => 'visitor@example.com',
        'rating' => 5,
        'message' => 'I enjoyed exploring Abuyog.',
        'status' => 'pending',
    ]);
});

it('uses the signed-in account identity for feedback', function () {
    $user = User::factory()->create([
        'name' => 'Account Visitor',
        'email' => 'account@example.com',
    ]);

    $this->actingAs($user)
        ->from('/')
        ->post('/feedback', [
            'name' => 'Spoofed Name',
            'email' => 'spoofed@example.com',
            'rating' => 4,
            'message' => 'A signed-in visitor response.',
        ])
        ->assertRedirect('/');

    $this->assertDatabaseHas('feedback', [
        'user_id' => $user->id,
        'name' => 'Account Visitor',
        'email' => 'account@example.com',
        'rating' => 4,
    ]);
});

it('rejects ratings outside the one-to-five range', function (int $rating) {
    $this->from('/')
        ->post('/feedback', [
            'name' => 'A Visitor',
            'email' => 'visitor@example.com',
            'rating' => $rating,
            'message' => 'Rating validation check.',
        ])
        ->assertSessionHasErrors('rating');

    expect(Feedback::query()->count())->toBe(0);
})->with([0, 6]);

it('allows only municipality and super admins to review feedback', function () {
    Feedback::create([
        'name' => 'Private Visitor',
        'email' => 'private@example.com',
        'rating' => 5,
        'message' => 'Review this response.',
    ]);

    $this->actingAs(User::factory()->create(['role' => 'municipality_admin']))
        ->get('/super-admin/feedback')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Feedback')
            ->where('feedback.0.email', 'private@example.com'));

    $this->actingAs(User::factory()->create(['role' => 'super_admin']))
        ->get('/super-admin/feedback')
        ->assertOk();

    $this->actingAs(User::factory()->create(['role' => 'resort_admin']))
        ->get('/super-admin/feedback')
        ->assertForbidden();
});

it('does not expose feedback contact information on the public homepage', function () {
    Feedback::create([
        'name' => 'Private Visitor',
        'email' => 'private@example.com',
        'rating' => 5,
        'message' => 'This should remain private.',
    ]);

    $this->get('/')
        ->assertOk()
        ->assertDontSee('private@example.com')
        ->assertDontSee('This should remain private.');
});
