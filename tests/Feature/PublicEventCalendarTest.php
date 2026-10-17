<?php

use App\Models\Announcement;
use App\Models\Resort;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('the public event calendar only shares published municipal events with recorded event dates', function () {
    $this->travelTo(Carbon::parse('2026-10-17 03:59:00', 'UTC'));
    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);
    $resort = Resort::query()->create(['name' => 'Calendar Resort', 'status' => 'active']);

    $multiDayEvent = Announcement::query()->create([
        'title' => 'Buyogan Festival',
        'slug' => 'buyogan-festival-calendar',
        'excerpt' => 'Community festival.',
        'content' => 'A celebration of Abuyog culture.',
        'category' => 'Festival',
        'status' => 'Published',
        'published_at' => now(),
        'created_by' => $municipalityAdmin->id,
        'event_start_date' => '2026-10-17',
        'event_end_date' => '2026-10-19',
        'event_start_time' => '08:30:00',
        'event_venue' => 'Abuyog, Leyte',
        'event_organizer' => 'Municipal Tourism Office',
        'event_contact_information' => 'Official contact not supplied.',
        'event_source_url' => 'https://example.test/buyogan',
        'event_date_status' => 'Confirmed',
    ]);
    Announcement::query()->create([
        'title' => 'Past Community Event',
        'slug' => 'past-community-event',
        'content' => 'A past local event.',
        'category' => 'Event',
        'status' => 'Published',
        'published_at' => now(),
        'created_by' => $municipalityAdmin->id,
        'event_start_date' => '2026-10-10',
    ]);
    Announcement::query()->create([
        'title' => 'Date Not Provided',
        'slug' => 'date-not-provided',
        'content' => 'This announcement has no event date.',
        'category' => 'Festival',
        'status' => 'Published',
        'published_at' => now(),
        'created_by' => $municipalityAdmin->id,
    ]);
    Announcement::query()->create([
        'title' => 'Draft Festival',
        'slug' => 'draft-festival',
        'content' => 'Not public.',
        'category' => 'Festival',
        'status' => 'Draft',
        'created_by' => $municipalityAdmin->id,
        'event_start_date' => '2026-10-18',
    ]);
    Announcement::query()->create([
        'title' => 'Resort Event',
        'slug' => 'resort-event',
        'content' => 'A resort-specific event.',
        'category' => 'Event',
        'status' => 'Published',
        'published_at' => now(),
        'created_by' => User::factory()->create(['role' => 'resort_admin', 'resort_id' => $resort->id])->id,
        'resort_id' => $resort->id,
        'event_start_date' => '2026-10-18',
    ]);
    Announcement::query()->create([
        'title' => 'Scheduled Festival Announcement',
        'slug' => 'scheduled-festival-announcement',
        'content' => 'Not published yet.',
        'category' => 'Festival',
        'status' => 'Published',
        'published_at' => now()->addYear(),
        'created_by' => $municipalityAdmin->id,
        'event_start_date' => '2026-10-18',
    ]);

    $this->get(route('events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/index')
            ->where('today', '2026-10-17')
            ->has('events', 2)
            ->where('events.0.startDate', '2026-10-10')
            ->where('events.1.id', $multiDayEvent->id)
            ->where('events.1.title', 'Buyogan Festival')
            ->where('events.1.startDate', '2026-10-17')
            ->where('events.1.endDate', '2026-10-19')
            ->where('events.1.startTime', '08:30')
            ->where('events.1.venue', 'Abuyog, Leyte')
            ->where('events.1.dateStatus', 'Confirmed'));
});

test('municipality admins can publish dated event announcements and the calendar shows their details', function () {
    $admin = User::factory()->create(['role' => 'municipality_admin']);
    $payload = [
        'title' => 'Buyogan Festival',
        'excerpt' => 'Bee-inspired community celebration.',
        'content' => 'Official festival description.',
        'category' => 'Festival',
        'status' => 'Published',
        'published_at' => now()->toDateTimeString(),
        'event_start_date' => '2027-08-15',
        'event_end_date' => '2027-08-16',
        'event_start_time' => '09:15',
        'event_venue' => 'Abuyog town center',
        'event_organizer' => 'Municipal Tourism Office',
        'event_contact_information' => 'Contact details from the organizer.',
        'event_source_url' => 'https://example.test/official-event',
        'event_date_status' => 'Tentative',
    ];

    $this->actingAs($admin)
        ->post(route('municipality-admin.announcements.store'), $payload)
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $event = Announcement::query()->where('slug', 'buyogan-festival')->firstOrFail();

    expect($event->event_start_date?->toDateString())->toBe('2027-08-15')
        ->and($event->event_end_date?->toDateString())->toBe('2027-08-16')
        ->and($event->event_date_status)->toBe('Tentative');

    $this->get(route('events.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('events', 1)
            ->where('events.0.title', 'Buyogan Festival')
            ->where('events.0.dateStatus', 'Tentative')
            ->where('events.0.sourceUrl', 'https://example.test/official-event'));

    $this->actingAs($admin)
        ->get(route('municipality-admin.announcements.edit', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('announcement.eventStartDate', '2027-08-15')
            ->where('announcement.eventEndDate', '2027-08-16')
            ->where('announcement.eventStartTime', '09:15')
            ->where('announcement.eventDateStatus', 'Tentative'));

    $payload['event_start_date'] = '2027-08-16';
    $payload['event_end_date'] = '2027-08-17';
    $payload['event_venue'] = 'Updated Abuyog town center';

    $this->actingAs($admin)
        ->put(route('municipality-admin.announcements.update', $event), $payload)
        ->assertRedirect(route('municipality-admin.announcements.index'));

    expect($event->refresh()->event_start_date?->toDateString())->toBe('2027-08-16')
        ->and($event->event_end_date?->toDateString())->toBe('2027-08-17')
        ->and($event->event_venue)->toBe('Updated Abuyog town center');

    $this->actingAs($admin)
        ->patch(route('municipality-admin.announcements.status', $event), ['status' => 'Archived'])
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $this->get(route('events.index'))
        ->assertInertia(fn (Assert $page) => $page->has('events', 0));
});

test('published events require valid non-duplicate dates and resort admins cannot create municipality events', function () {
    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);
    $resort = Resort::query()->create(['name' => 'Event Permissions Resort', 'status' => 'active']);
    $resortAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $resort->id,
    ]);
    $payload = [
        'title' => 'Annual Community Festival',
        'content' => 'Event details.',
        'category' => 'Festival',
        'status' => 'Published',
        'published_at' => now()->toDateTimeString(),
        'event_start_date' => '',
        'event_end_date' => '',
        'event_start_time' => '',
        'event_venue' => '',
        'event_organizer' => '',
        'event_contact_information' => '',
        'event_source_url' => '',
        'event_date_status' => 'Confirmed',
    ];

    $this->actingAs($municipalityAdmin)
        ->post(route('municipality-admin.announcements.store'), $payload)
        ->assertSessionHasErrors('event_start_date');

    $payload['event_start_date'] = '2027-08-16';
    $payload['event_end_date'] = '2027-08-15';

    $this->post(route('municipality-admin.announcements.store'), $payload)
        ->assertSessionHasErrors('event_end_date');

    $payload['event_end_date'] = '';
    $this->post(route('municipality-admin.announcements.store'), $payload)
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $this->post(route('municipality-admin.announcements.store'), $payload)
        ->assertSessionHasErrors('title');

    $this->actingAs($resortAdmin)
        ->post(route('municipality-admin.announcements.store'), $payload)
        ->assertForbidden();

    expect(Announcement::query()->where('title', 'Annual Community Festival')->count())->toBe(1);
});

test('event announcements cannot be published through the status action without a start date', function () {
    $admin = User::factory()->create(['role' => 'municipality_admin']);
    $draft = Announcement::query()->create([
        'title' => 'Undated Festival Draft',
        'slug' => 'undated-festival-draft',
        'content' => 'An event waiting for its official date.',
        'category' => 'Festival',
        'status' => 'Draft',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('municipality-admin.announcements.status', $draft), ['status' => 'Published'])
        ->assertSessionHasErrors('event_start_date');

    expect($draft->refresh()->status)->toBe('Draft')
        ->and($draft->published_at)->toBeNull();

    $draft->update(['event_start_date' => '2026-11-20']);

    $this->patch(route('municipality-admin.announcements.status', $draft), ['status' => 'Published'])
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $this->get(route('events.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('events', 1)
            ->where('events.0.title', 'Undated Festival Draft')
            ->where('events.0.startDate', '2026-11-20'));
});
