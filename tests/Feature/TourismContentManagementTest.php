<?php

use App\Models\Announcement;
use App\Models\ContentChange;
use App\Models\ContentImage;
use App\Models\Resort;
use App\Models\TouristSpot;
use App\Models\User;
use App\Services\ContentChangeLogger;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

it('lets municipal staff manage and restore destinations without publishing restored records', function () {
    $staff = User::factory()->create(['role' => 'municipality_admin']);

    $this->actingAs($staff)
        ->post(route('municipality-admin.tourist-spots.store'), [
            'name' => 'Coastal Heritage Point',
            'description' => 'A locally recorded destination.',
            'location' => 'Barangay Santa Cruz',
            'category' => 'Heritage',
            'status' => 'inactive',
        ])
        ->assertRedirect(route('municipality-admin.tourist-spots'));

    $spot = TouristSpot::query()->where('name', 'Coastal Heritage Point')->firstOrFail();
    expect($spot->status)->toBe('inactive');
    $image = $spot->images()->create(['path' => 'content-images/retained.jpg', 'sort_order' => 0]);

    $this->actingAs($staff)
        ->put(route('municipality-admin.tourist-spots.update', $spot), [
            'name' => 'Coastal Heritage Point Updated',
            'description' => 'Updated visitor description.',
            'location' => 'Barangay Santa Cruz',
            'category' => 'Heritage',
            'status' => 'inactive',
        ])
        ->assertRedirect(route('municipality-admin.tourist-spots'));

    expect(ContentImage::query()->find($image->id))->not->toBeNull();

    $this->actingAs($staff)
        ->patch(route('municipality-admin.tourist-spots.status', $spot), ['status' => 'active'])
        ->assertRedirect();
    $this->get(route('map'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('touristSpots.0.name', 'Coastal Heritage Point Updated'));

    $this->actingAs($staff)
        ->patch(route('municipality-admin.tourist-spots.status', $spot), ['status' => 'Archived'])
        ->assertRedirect();
    $this->get(route('map'))->assertInertia(fn (Assert $page) => $page->has('touristSpots', 0));

    $this->actingAs($staff)
        ->patch(route('municipality-admin.tourist-spots.restore', $spot))
        ->assertRedirect();
    expect($spot->fresh()->status)->toBe('inactive')
        ->and(ContentImage::query()->find($image->id))->not->toBeNull()
        ->and(ContentChange::query()->where('content_type', TouristSpot::class)->where('content_id', $spot->id)->pluck('action')->all())
        ->toContain('created', 'edited', 'status_changed', 'archived', 'restored');
    $this->get(route('map'))->assertInertia(fn (Assert $page) => $page->has('touristSpots', 0));
});

it('filters and paginates destination records by text, category, and status', function () {
    $staff = User::factory()->create(['role' => 'municipality_admin']);
    foreach (range(1, 17) as $index) {
        TouristSpot::query()->create([
            'name' => "Coast Destination {$index}",
            'description' => 'Visitor description',
            'location' => 'Abuyog',
            'category' => $index === 17 ? 'Heritage' : 'Nature',
            'status' => 'inactive',
        ]);
    }

    $this->actingAs($staff)
        ->get(route('municipality-admin.tourist-spots', ['search' => '  coast  ', 'category' => 'Nature', 'status' => 'inactive']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Municipality/TouristSpots/Index')
            ->has('spots.data', 15)
            ->where('spots.total', 16)
            ->where('filters.category', 'Nature')
            ->where('filters.status', 'inactive'));

    $this->actingAs($staff)
        ->get(route('municipality-admin.tourist-spots', ['status' => 'invalid']))
        ->assertSessionHasErrors('status');
});

it('filters and paginates announcements using the existing management pages', function () {
    $staff = User::factory()->create(['role' => 'municipality_admin']);
    foreach (range(1, 17) as $index) {
        Announcement::query()->create([
            'title' => "Abuyog tourism update {$index}",
            'slug' => "abuyog-tourism-update-{$index}",
            'excerpt' => 'Visitor information.',
            'content' => 'Tourism announcement content.',
            'category' => $index === 17 ? 'Heritage' : 'Tourism Update',
            'status' => $index === 17 ? 'Archived' : 'Draft',
            'created_by' => $staff->id,
        ]);
    }

    $this->actingAs($staff)
        ->get(route('municipality-admin.announcements.index', [
            'search' => '  TOURISM   ',
            'category' => 'Tourism Update',
            'status' => 'Draft',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Municipality/Announcements/Index')
            ->has('announcements.data', 15)
            ->where('announcements.total', 16)
            ->where('filters.status', 'Draft'));
});

it('restricts destination management to municipality and super administrators', function () {
    $spot = TouristSpot::query()->create([
        'name' => 'Protected destination',
        'category' => 'Nature',
        'status' => 'inactive',
    ]);

    $this->get(route('municipality-admin.tourist-spots'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('municipality-admin.tourist-spots'))
        ->assertForbidden();
    $this->patch(route('municipality-admin.tourist-spots.status', $spot), ['status' => 'active'])
        ->assertForbidden();
    expect($spot->fresh()->status)->toBe('inactive');
});

it('restores archived announcements as drafts and records content history', function () {
    $staff = User::factory()->create(['role' => 'municipality_admin']);
    $this->actingAs($staff)
        ->post(route('municipality-admin.announcements.store'), [
            'title' => 'Heritage story',
            'excerpt' => 'A story.',
            'content' => 'Heritage content.',
            'category' => 'Heritage',
            'status' => 'Published',
        ])
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $announcement = Announcement::query()->where('title', 'Heritage story')->firstOrFail();
    expect(ContentChange::query()->where('content_type', Announcement::class)->where('content_id', $announcement->id)->firstOrFail()->action)->toBe('created');

    $this->actingAs($staff)
        ->patch(route('municipality-admin.announcements.status', $announcement), ['status' => 'Archived'])
        ->assertRedirect();
    $this->get(route('announcements.show', $announcement->slug))->assertNotFound();

    $this->actingAs($staff)
        ->patch(route('municipality-admin.announcements.restore', $announcement))
        ->assertRedirect();

    expect($announcement->fresh()->status)->toBe('Draft')
        ->and($announcement->fresh()->published_at)->toBeNull()
        ->and(ContentChange::query()->where('content_type', Announcement::class)->where('content_id', $announcement->id)->pluck('action')->all())
        ->toContain('created', 'archived', 'restored');
    $this->get(route('announcements.show', $announcement->slug))->assertNotFound();
});

it('restricts the content history page and scopes resort administrators to assigned content', function () {
    $resort = Resort::query()->create(['name' => 'Assigned resort', 'status' => 'active']);
    $otherResort = Resort::query()->create(['name' => 'Other resort', 'status' => 'active']);
    $admin = User::factory()->create(['role' => 'resort_admin', 'resort_id' => $resort->id]);
    $otherAdmin = User::factory()->create(['role' => 'resort_admin', 'resort_id' => $otherResort->id]);
    $ownAnnouncement = Announcement::query()->create([
        'title' => 'Own resort update',
        'slug' => 'own-resort-update',
        'content' => 'Own content.',
        'category' => 'Resort Update',
        'status' => 'Draft',
        'created_by' => $admin->id,
        'resort_id' => $resort->id,
    ]);
    $otherAnnouncement = Announcement::query()->create([
        'title' => 'Other resort update',
        'slug' => 'other-resort-update',
        'content' => 'Other content.',
        'category' => 'Resort Update',
        'status' => 'Draft',
        'created_by' => $otherAdmin->id,
        'resort_id' => $otherResort->id,
    ]);
    app(ContentChangeLogger::class)->record($admin, $ownAnnouncement, 'created', null, ['title' => 'Own resort update']);
    app(ContentChangeLogger::class)->record($otherAdmin, $otherAnnouncement, 'created', null, ['title' => 'Other resort update']);

    $this->actingAs($admin)
        ->get(route('content-history.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('changes.data', 1)
            ->where('changes.data.0.description', 'Created Announcement "Own resort update" (title)')
            ->where('canViewAll', false));
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('content-history.index'))
        ->assertForbidden();
});

it('allows super administrators to manage visitor accounts without exposing protected roles', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->post(route('super-admin.accounts.store'), [
            'name' => 'Portal Visitor',
            'email' => 'portal.visitor@example.test',
            'role' => 'user',
            'password' => 'Tourism@12345',
        ])
        ->assertRedirect(route('super-admin.accounts.index'));

    $visitor = User::query()->where('email', 'portal.visitor@example.test')->firstOrFail();
    expect($visitor->role)->toBe('user')
        ->and(Hash::check('Tourism@12345', $visitor->password))->toBeTrue();

    $this->actingAs($admin)
        ->get(route('super-admin.accounts.index', ['search' => 'portal visitor', 'role' => 'user', 'status' => 'active']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('accounts.data', 1)
            ->where('accounts.data.0.email', 'portal.visitor@example.test'));

    $this->actingAs($admin)
        ->put(route('super-admin.accounts.update', $visitor), [
            'name' => $visitor->name,
            'email' => $visitor->email,
            'role' => 'super_admin',
            'password' => '',
        ])
        ->assertSessionHasErrors('role');
    expect($visitor->fresh()->role)->toBe('user');

    $resort = Resort::query()->create(['name' => 'Role assignment resort', 'status' => 'active']);
    $this->actingAs($admin)
        ->put(route('super-admin.accounts.update', $visitor), [
            'name' => $visitor->name,
            'email' => $visitor->email,
            'role' => 'resort_admin',
            'resort_id' => $resort->id,
            'password' => '',
        ])
        ->assertRedirect(route('super-admin.accounts.index'));
    expect($visitor->fresh()->role)->toBe('resort_admin')
        ->and($visitor->fresh()->resort_id)->toBe($resort->id);

    $this->actingAs($admin)
        ->patch(route('super-admin.accounts.status', $visitor), [
            'is_active' => false,
            'reason' => 'Suspected fraudulent bookings',
        ])
        ->assertRedirect();
    expect($visitor->fresh()->is_active)->toBeFalse();
});
