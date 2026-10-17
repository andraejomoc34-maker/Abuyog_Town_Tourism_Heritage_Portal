<?php

use App\Models\Announcement;
use App\Models\Resort;
use App\Models\TouristSpot;
use App\Models\User;
use App\Services\DestinationViewRecorder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

it('shows feedback, content, and filtered operations analytics from stored records', function () {
    $this->travelTo(Carbon::parse('2026-10-17 02:00:00', 'UTC'));
    $selectedResort = Resort::query()->create(['name' => 'Selected resort', 'status' => 'active']);
    $otherResort = Resort::query()->create(['name' => 'Other resort', 'status' => 'active']);
    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);

    foreach ([
        ['resort_id' => $selectedResort->id, 'rating' => 5, 'created_at' => '2026-10-16 20:00:00'],
        ['resort_id' => $selectedResort->id, 'rating' => 3, 'created_at' => '2026-10-17 02:00:00'],
        ['resort_id' => $selectedResort->id, 'rating' => 1, 'created_at' => '2026-10-16 15:59:00'],
        ['resort_id' => $otherResort->id, 'rating' => 2, 'created_at' => '2026-10-16 21:00:00'],
    ] as $row) {
        DB::table('feedback')->insert([
            'resort_id' => $row['resort_id'],
            'name' => 'Private name',
            'email' => 'private@example.test',
            'rating' => $row['rating'],
            'message' => 'Private feedback text',
            'created_at' => $row['created_at'],
            'updated_at' => $row['created_at'],
        ]);
    }

    TouristSpot::query()->create(['name' => 'Active destination', 'category' => 'Heritage', 'status' => 'active']);
    TouristSpot::query()->create(['name' => 'Draft destination', 'category' => 'Nature', 'status' => 'inactive']);
    Announcement::query()->create([
        'title' => 'Published festival',
        'slug' => 'published-festival-analytics',
        'content' => 'Festival content',
        'category' => 'Festival',
        'status' => 'Published',
        'created_by' => $municipalityAdmin->id,
    ]);
    Announcement::query()->create([
        'title' => 'Draft heritage',
        'slug' => 'draft-heritage-analytics',
        'content' => 'Heritage content',
        'category' => 'Heritage',
        'status' => 'Draft',
        'created_by' => $municipalityAdmin->id,
    ]);
    $resortAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $selectedResort->id,
    ]);
    Announcement::query()->create([
        'title' => 'Resort promotion',
        'slug' => 'resort-promotion-analytics',
        'content' => 'Resort-owned content',
        'category' => 'Event',
        'status' => 'Published',
        'created_by' => $resortAdmin->id,
        'resort_id' => $selectedResort->id,
    ]);

    DB::table('bookings')->insert([
        ['user_id' => User::factory()->create(['role' => 'user'])->id, 'resort_id' => $selectedResort->id, 'booking_date' => '2026-10-20', 'guests' => 1, 'status' => 'Pending', 'created_at' => '2026-10-16 21:00:00', 'updated_at' => '2026-10-16 21:00:00'],
        ['user_id' => User::factory()->create(['role' => 'user'])->id, 'resort_id' => $otherResort->id, 'booking_date' => '2026-10-20', 'guests' => 1, 'status' => 'Pending', 'created_at' => '2026-10-16 21:00:00', 'updated_at' => '2026-10-16 21:00:00'],
    ]);

    $this->actingAs($municipalityAdmin)
        ->get(route('municipality-admin.reports', [
            'from' => '2026-10-17',
            'to' => '2026-10-17',
            'resort_id' => $selectedResort->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Municipality/Reports')
            ->where('analytics.feedback.total', 2)
            ->where('analytics.feedback.averageRating', 4)
            ->where('analytics.feedback.ratingDistribution.2.count', 1)
            ->where('analytics.feedback.ratingDistribution.3.count', 0)
            ->where('analytics.feedback.ratingDistribution.4.count', 1)
            ->where('analytics.feedback.trends.0.date', '2026-10-17')
            ->where('analytics.feedback.trends.0.count', 2)
            ->where('analytics.content.published', 2)
            ->where('analytics.content.unpublished', 2)
            ->where('analytics.operations.bookings', 1)
            ->where('analytics.operations.inquiries', 0)
            ->where('analytics.filters.resortId', $selectedResort->id)
            ->missing('analytics.feedback.email')
            ->missing('analytics.feedback.message'));

    $this->actingAs(User::factory()->create(['role' => 'super_admin']))
        ->get(route('super-admin.reports', [
            'from' => '2026-10-17',
            'to' => '2026-10-17',
            'resort_id' => $selectedResort->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('analytics.content.published', 3)
            ->where('dashboardUrl', route('super-admin.dashboard')));
});

it('returns actual recorded destination rankings and empty feedback values safely', function () {
    $spot = TouristSpot::query()->create([
        'name' => 'Tracked waterfall',
        'category' => 'Nature',
        'status' => 'active',
    ]);
    $resort = Resort::query()->create(['name' => 'Tracked resort', 'status' => 'active']);
    DB::table('destination_views')->insert([
        'destination_type' => 'spot',
        'destination_id' => $spot->id,
        'visitor_key' => str_repeat('a', 64),
        'viewed_on' => '2026-10-17',
        'viewed_at' => '2026-10-17 01:00:00',
    ]);
    DB::table('destination_views')->insert([
        'destination_type' => 'resort',
        'destination_id' => $resort->id,
        'visitor_key' => str_repeat('b', 64),
        'viewed_on' => '2026-10-17',
        'viewed_at' => '2026-10-17 01:00:00',
    ]);

    $this->actingAs(User::factory()->create(['role' => 'municipality_admin']))
        ->get(route('municipality-admin.reports', ['from' => '2026-10-17', 'to' => '2026-10-17']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('analytics.feedback.total', 0)
            ->where('analytics.feedback.averageRating', null)
            ->has('analytics.destinations', 2)
            ->where('analytics.destinations.0.name', 'Tracked waterfall')
            ->where('analytics.destinations.1.name', 'Tracked resort'));
});

it('records one anonymous destination view per visitor session and Manila calendar day', function () {
    $this->travelTo(Carbon::parse('2026-10-16 16:30:00', 'UTC'));
    $spot = TouristSpot::query()->create([
        'name' => 'Daily unique destination',
        'category' => 'Nature',
        'status' => 'active',
    ]);

    $session = app('session')->driver();
    $session->setId('stable-visitor-session');
    $request = Request::create('/destination-views', 'POST');
    $request->setLaravelSession($session);
    $recorder = app(DestinationViewRecorder::class);
    $recorder->record($request, $spot);
    $recorder->record($request, $spot);

    $this->assertDatabaseCount('destination_views', 1);
    $this->assertDatabaseHas('destination_views', [
        'destination_id' => $spot->id,
        'viewed_on' => '2026-10-17',
    ]);

    $this->postJson(route('destination-views.store'), ['type' => 'spot', 'id' => $spot->id])->assertAccepted();
    $this->assertDatabaseCount('destination_views', 2);

    $inactiveSpot = TouristSpot::query()->create([
        'name' => 'Hidden destination',
        'category' => 'Nature',
        'status' => 'inactive',
    ]);
    $this->postJson(route('destination-views.store'), ['type' => 'spot', 'id' => $inactiveSpot->id])->assertNotFound();
    $this->assertDatabaseCount('destination_views', 2);
});

it('protects reports from unauthorized roles and validates date ranges', function () {
    $this->travelTo(Carbon::parse('2026-10-17 02:00:00', 'UTC'));
    $this->actingAs(User::factory()->create(['role' => 'resort_admin']))
        ->get(route('municipality-admin.reports'))
        ->assertForbidden();

    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);
    $this->actingAs($municipalityAdmin)
        ->get(route('municipality-admin.reports', ['from' => '2025-01-01', 'to' => '2026-10-17']))
        ->assertSessionHasErrors('from');

    $this->actingAs($municipalityAdmin)
        ->get(route('municipality-admin.reports', ['from' => '2026-10-18']))
        ->assertSessionHasErrors('from');

    $this->actingAs(User::factory()->create(['role' => 'super_admin']))
        ->get(route('super-admin.reports'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Municipality/Reports')
            ->where('dashboardUrl', route('super-admin.dashboard')));
});
