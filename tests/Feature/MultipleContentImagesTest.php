<?php

use App\Models\Announcement;
use App\Models\ContentImage;
use App\Models\Resort;
use App\Models\TouristSpot;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function announcementImagePayload(string $title = 'Heritage photo story'): array
{
    return [
        'title' => $title,
        'excerpt' => 'Photos from Abuyog.',
        'content' => 'A public tourism and heritage story.',
        'category' => 'Heritage',
        'status' => 'Published',
        'published_at' => now()->toDateTimeString(),
    ];
}

function fakeTourismImage(string $name, bool $oversized = false): UploadedFile
{
    $imageContent = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=',
        true,
    );

    if ($oversized) {
        $imageContent .= str_repeat("\0", 5 * 1024 * 1024);
    }

    return UploadedFile::fake()->createWithContent($name, $imageContent);
}

it('uploads multiple announcement images and supports retaining, adding, and individually removing photos', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'municipality_admin']);

    $this->actingAs($admin)
        ->post(route('municipality-admin.announcements.store'), [
            ...announcementImagePayload(),
            'images' => [
                fakeTourismImage('heritage-one.png'),
                fakeTourismImage('heritage-two.png'),
            ],
        ])
        ->assertRedirect(route('municipality-admin.announcements.index'));

    $announcement = Announcement::query()->where('title', 'Heritage photo story')->firstOrFail();
    $images = $announcement->images()->orderBy('id')->get();

    expect($images)->toHaveCount(2);
    $removedImage = $images->first();
    $retainedImage = $images->last();
    Storage::disk('public')->assertExists($removedImage->path);
    Storage::disk('public')->assertExists($retainedImage->path);

    $this->get(route('announcements.show', $announcement->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('announcement.title', 'Heritage photo story')
            ->has('announcement.images', 2));

    $this->put(route('municipality-admin.announcements.update', $announcement), [
        ...announcementImagePayload(),
        'images' => [fakeTourismImage('heritage-three.png')],
        'remove_image_ids' => [$removedImage->id],
    ])->assertRedirect(route('municipality-admin.announcements.index'));

    expect($announcement->images()->count())->toBe(2);
    expect(ContentImage::query()->find($retainedImage->id))->not->toBeNull();
    Storage::disk('public')->assertMissing($removedImage->path);
    Storage::disk('public')->assertExists($retainedImage->path);
    Storage::disk('public')->assertExists($announcement->images()->latest('id')->firstOrFail()->path);
});

it('rejects invalid and oversized image uploads without creating image records', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'municipality_admin']);

    $this->actingAs($admin)
        ->post(route('municipality-admin.announcements.store'), [
            ...announcementImagePayload('Invalid image type'),
            'images' => [UploadedFile::fake()->create('notes.txt', 1, 'text/plain')],
        ])
        ->assertSessionHasErrors('images.0');

    $this->post(route('municipality-admin.announcements.store'), [
        ...announcementImagePayload('Oversized image'),
        'images' => [fakeTourismImage('too-large.png', true)],
    ])->assertSessionHasErrors('images.0');

    expect(ContentImage::query()->count())->toBe(0);
});

it('scopes tourist destination photo management to authorized municipal staff and owned images', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'municipality_admin']);
    $spot = TouristSpot::query()->create([
        'name' => 'Abuyog heritage marker',
        'category' => 'Heritage',
        'status' => 'active',
    ]);
    $otherSpot = TouristSpot::query()->create([
        'name' => 'Another attraction',
        'category' => 'Nature',
        'status' => 'active',
    ]);
    $otherImage = $otherSpot->images()->create([
        'path' => fakeTourismImage('other-spot.png')->store('content-images', 'public'),
        'sort_order' => 0,
    ]);

    $this->actingAs($admin)
        ->patch(route('municipality-admin.tourist-spots.images.update', $spot), [
            'images' => [
                fakeTourismImage('marker-one.png'),
                fakeTourismImage('marker-two.png'),
            ],
        ])
        ->assertRedirect();

    $this->patch(route('municipality-admin.tourist-spots.images.update', $spot), [
        'remove_image_ids' => [$otherImage->id],
    ])->assertSessionHasErrors('remove_image_ids');

    expect($spot->images()->count())->toBe(2);
    expect(ContentImage::query()->find($otherImage->id))->not->toBeNull();

    $this->get('/map')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('touristSpots.0.name', 'Abuyog heritage marker')
            ->has('touristSpots.0.images', 2));

    $this->actingAs(User::factory()->create(['role' => 'resort_admin']))
        ->patch(route('municipality-admin.tourist-spots.images.update', $spot), [
            'images' => [fakeTourismImage('unauthorized.png')],
        ])
        ->assertForbidden();
});

it('allows resort admins to upload profile images only for their assigned resort', function () {
    Storage::fake('public');
    $resort = Resort::query()->create([
        'name' => 'Local Resort',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $otherResort = Resort::query()->create([
        'name' => 'Other Resort',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $admin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $resort->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('resort-admin.settings.update'), [
            'name' => $resort->name,
            'location' => $resort->location,
            'images' => [
                fakeTourismImage('resort-one.png'),
                fakeTourismImage('resort-two.png'),
            ],
        ])
        ->assertRedirect(route('resort-admin.settings'));

    expect($resort->images()->count())->toBe(2);

    $this->get(route('resort-admin.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ResortDashboard')
            ->has('resort.images', 2));

    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->patch(route('resort-admin.settings.update'), [
            'name' => $otherResort->name,
            'location' => $otherResort->location,
            'images' => [fakeTourismImage('forbidden.png')],
        ])
        ->assertForbidden();
});
