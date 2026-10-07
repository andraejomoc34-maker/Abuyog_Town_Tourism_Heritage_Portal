<?php

use App\Models\Announcement;
use App\Models\Booking;
use App\Models\Resort;
use App\Models\User;
use Database\Seeders\MunicipalityAdminSeeder;
use Inertia\Testing\AssertableInertia as Assert;

it('routes municipality admins to their own dashboard and blocks higher-level areas', function () {
    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);

    $this->post(route('login.store'), [
        'email' => $municipalityAdmin->email,
        'password' => 'password',
    ])->assertRedirect(route('municipality-admin.dashboard'));

    $this->get(route('municipality-admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Municipality/Dashboard'));

    $this->get(route('super-admin.dashboard'))->assertForbidden();

    $this->actingAs(User::factory()->create(['role' => 'resort_admin']))
        ->get(route('municipality-admin.dashboard'))
        ->assertForbidden();

    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('municipality-admin.dashboard'))
        ->assertForbidden();
});

it('shows database-backed cross-resort records to municipality admins without granting booking updates', function () {
    $resort = Resort::create([
        'name' => 'Castañas Spring Resort',
        'description' => 'Sample resort.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $customer = User::factory()->create(['role' => 'user']);
    $booking = Booking::create([
        'user_id' => $customer->id,
        'resort_id' => $resort->id,
        'booking_date' => now()->addDay()->toDateString(),
        'guests' => 2,
        'message' => 'Sample booking.',
        'status' => 'Pending',
    ]);
    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);

    $this->actingAs($municipalityAdmin)
        ->get(route('municipality-admin.bookings'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Municipality/Records')
            ->where('title', 'All Bookings')
            ->has('records', 1)
            ->where('records.0.resort', 'Castañas Spring Resort'));

    $this->actingAs($municipalityAdmin)
        ->patch(route('bookings.status', $booking), ['status' => 'Confirmed'])
        ->assertForbidden();
});

it('allows municipality and super admins to manage announcements and exposes only published entries publicly', function () {
    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);

    $this->actingAs($municipalityAdmin)
        ->post(route('municipality-admin.announcements.store'), [
            'title' => 'Buyogan Festival Advisory',
            'excerpt' => 'Festival route details.',
            'content' => 'Official festival route and visitor advisory.',
            'category' => 'Festival',
            'status' => 'Draft',
            'published_at' => null,
        ])
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $announcement = Announcement::query()->firstOrFail();
    expect($announcement->created_by)->toBe($municipalityAdmin->id)
        ->and($announcement->slug)->toBe('buyogan-festival-advisory')
        ->and($announcement->status)->toBe('Draft');

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->has('announcements', 0));

    $this->actingAs($municipalityAdmin)
        ->patch(route('municipality-admin.announcements.status', $announcement), ['status' => 'Published'])
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('announcements', 1)
            ->where('announcements.0.title', 'Buyogan Festival Advisory')
            ->missing('announcements.0.created_by'));

    $this->get(route('announcements.show', $announcement->slug))->assertOk();

    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $this->actingAs($superAdmin)
        ->patch(route('super-admin.announcements.status', $announcement), ['status' => 'Archived'])
        ->assertRedirect(route('super-admin.announcements.index'));

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->has('announcements', 0));
    $this->get(route('announcements.show', $announcement->slug))->assertNotFound();
});

it('blocks resort admins and users from municipality-wide announcements', function () {
    $announcement = Announcement::create([
        'title' => 'Public Notice',
        'slug' => 'public-notice',
        'content' => 'Notice body.',
        'category' => 'Public Notice',
        'status' => 'Draft',
        'created_by' => User::factory()->create(['role' => 'super_admin'])->id,
    ]);

    foreach (['resort_admin', 'user'] as $role) {
        $this->actingAs(User::factory()->create(['role' => $role]))
            ->get(route('municipality-admin.announcements.index'))
            ->assertForbidden();

        $this->actingAs(User::factory()->create(['role' => $role]))
            ->patch(route('municipality-admin.announcements.status', $announcement), ['status' => 'Published'])
            ->assertForbidden();
    }
});

it('allows a super admin to create only municipality or resort admin accounts', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($superAdmin)
        ->post(route('super-admin.accounts.store'), [
            'name' => 'Abuyog Municipality Tourism Admin',
            'email' => 'municipality.staff@example.test',
            'role' => 'municipality_admin',
            'password' => 'Municipality@12345',
        ])
        ->assertRedirect(route('super-admin.accounts.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'municipality.staff@example.test',
        'role' => 'municipality_admin',
    ]);

    $this->actingAs($superAdmin)
        ->post(route('super-admin.accounts.store'), [
            'name' => 'Escalation Attempt',
            'email' => 'escalation@example.test',
            'role' => 'super_admin',
            'password' => 'password123',
        ])
        ->assertSessionHasErrors('role');

    $this->assertDatabaseMissing('users', ['email' => 'escalation@example.test']);

    $this->actingAs(User::factory()->create(['role' => 'municipality_admin']))
        ->get(route('super-admin.accounts.index'))
        ->assertForbidden();
});

it('creates the requested demo municipality account only in local and testing environments', function () {
    $superAdmin = User::factory()->create([
        'name' => 'Existing Super Admin',
        'email' => 'admin@abuyogtourism.test',
        'role' => 'super_admin',
    ]);

    app(MunicipalityAdminSeeder::class)->run();
    app(MunicipalityAdminSeeder::class)->run();

    $this->assertDatabaseHas('users', [
        'name' => 'Existing Super Admin',
        'email' => 'admin@abuyogtourism.test',
        'role' => 'super_admin',
    ]);
    $this->assertDatabaseHas('users', [
        'name' => 'Abuyog Municipality Tourism Admin',
        'email' => 'municipality.admin@abuyogtourism.test',
        'role' => 'municipality_admin',
        'is_active' => true,
    ]);

    $this->post(route('login.store'), [
        'email' => 'municipality.admin@abuyogtourism.test',
        'password' => 'Municipality@12345',
    ])->assertRedirect(route('municipality-admin.dashboard'));

    expect(User::where('email', 'municipality.admin@abuyogtourism.test')->count())->toBe(1)
        ->and($superAdmin->fresh()->role)->toBe('super_admin');
});

it('prevents a disabled admin from signing in', function () {
    $disabledAdmin = User::factory()->create([
        'role' => 'municipality_admin',
        'is_active' => false,
    ]);

    $this->post(route('login.store'), [
        'email' => $disabledAdmin->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});
