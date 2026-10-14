<?php

use App\Models\Booking;
use App\Models\HotelRoom;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\User;
use App\Notifications\ResortAdminNotification;
use App\Services\ResortAdminNotifier;
use Inertia\Testing\AssertableInertia as Assert;

function notificationTestResort(string $name = 'Test Resort'): Resort
{
    return Resort::query()->create([
        'name' => $name,
        'description' => 'A test property.',
        'location' => 'Abuyog, Leyte',
        'image' => '/abuyog-1.jpg',
        'status' => 'active',
        'property_type' => 'resort',
        'property_code' => strtolower(str_replace(' ', '-', $name)),
    ]);
}

it('returns only the signed-in user notifications and their unread count', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $user->notify(new ResortAdminNotification(
        'Booking status updated',
        'Your booking is confirmed.',
        '/my-bookings/1',
        'booking',
    ));
    $otherUser->notify(new ResortAdminNotification(
        'Private update',
        'This belongs to another account.',
        '/dashboard',
    ));

    $this->actingAs($user)
        ->getJson('/notifications/feed')
        ->assertOk()
        ->assertJsonPath('unreadCount', 1)
        ->assertJsonPath('notifications.0.title', 'Booking status updated')
        ->assertJsonPath('notifications.0.type', 'booking')
        ->assertJsonPath('notifications.0.url', '/my-bookings/1')
        ->assertJsonMissing(['title' => 'Private update']);
});

it('marks only an owned notification as read and supports mark all as read', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $user->notify(new ResortAdminNotification('First update', 'First message.', '/dashboard'));
    $user->notify(new ResortAdminNotification('Second update', 'Second message.', '/dashboard'));
    $otherUser->notify(new ResortAdminNotification('Private update', 'Private message.', '/dashboard'));

    $firstNotification = $user->notifications()->oldest()->firstOrFail();
    $otherNotification = $otherUser->notifications()->firstOrFail();

    $this->actingAs($user)
        ->patchJson('/notifications/'.$firstNotification->id.'/read')
        ->assertOk()
        ->assertJsonPath('unreadCount', 1);
    expect($firstNotification->fresh()->read_at)->not->toBeNull();

    $this->patchJson('/notifications/'.$otherNotification->id.'/read')
        ->assertNotFound();

    $this->patchJson('/notifications/read-all')
        ->assertOk()
        ->assertJsonPath('unreadCount', 0);

    expect($user->unreadNotifications()->count())->toBe(0)
        ->and($otherUser->unreadNotifications()->count())->toBe(1);
});

it('shows an empty paginated notification page to an authenticated user', function () {
    $this->actingAs(User::factory()->create())
        ->get('/notifications')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 0)
            ->where('notifications.total', 0));
});

it('sends booking status changes only to the booking owner and only once per transition', function () {
    $resort = notificationTestResort();
    $admin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $resort->id,
    ]);
    $guest = User::factory()->create();
    $otherGuest = User::factory()->create();
    $booking = Booking::query()->create([
        'user_id' => $guest->id,
        'resort_id' => $resort->id,
        'booking_date' => today()->addDay(),
        'guests' => 2,
        'status' => 'Pending',
    ]);

    $this->actingAs($admin)
        ->patch('/bookings/'.$booking->id.'/status', ['status' => 'Confirmed'])
        ->assertRedirect();

    expect($guest->unreadNotifications()->count())->toBe(1)
        ->and($otherGuest->unreadNotifications()->count())->toBe(0);

    $this->patch('/bookings/'.$booking->id.'/status', ['status' => 'Confirmed'])
        ->assertRedirect();

    expect($guest->unreadNotifications()->count())->toBe(1);
});

it('notifies only the assigned hotel administrators when a booking is submitted', function () {
    $hotel = Resort::query()->create([
        'name' => 'Abuyog Hotel',
        'description' => 'Hotel test property.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
        'property_type' => 'hotel',
        'property_code' => 'abuyog-hotel',
    ]);
    $otherHotel = Resort::query()->create([
        'name' => 'Another Hotel',
        'description' => 'Another test property.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
        'property_type' => 'hotel',
        'property_code' => 'another-hotel',
    ]);
    $hotelAdmin = User::factory()->create([
        'role' => 'hotel_admin',
        'resort_id' => $hotel->id,
    ]);
    $otherHotelAdmin = User::factory()->create([
        'role' => 'hotel_admin',
        'resort_id' => $otherHotel->id,
    ]);
    $guest = User::factory()->create([
        'contact_number' => '+639171234567',
    ]);
    $room = HotelRoom::query()->create([
        'resort_id' => $hotel->id,
        'name' => 'Standard Room',
        'room_type' => 'Standard',
        'capacity' => 2,
        'available_quantity' => 1,
        'status' => 'Available',
    ]);

    $this->actingAs($guest)
        ->post('/resorts/'.$hotel->id.'/book', [
            'room_id' => $room->id,
            'booking_date' => today()->addDay()->toDateString(),
            'guests' => 2,
            'message' => 'Late arrival.',
        ])
        ->assertRedirect();

    expect($hotelAdmin->unreadNotifications()->count())->toBe(1)
        ->and($otherHotelAdmin->unreadNotifications()->count())->toBe(0);
    expect($hotelAdmin->unreadNotifications()->firstOrFail()->data['type'])->toBe('booking');
});

it('notifies the guest when a resort inquiry status changes', function () {
    $resort = notificationTestResort();
    $admin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $resort->id,
    ]);
    $guest = User::factory()->create();
    $inquiry = Inquiry::query()->create([
        'user_id' => $guest->id,
        'resort_id' => $resort->id,
        'message' => 'Is a room available?',
        'status' => 'Pending',
    ]);

    $this->actingAs($admin)
        ->patch('/inquiries/'.$inquiry->id.'/status', ['status' => 'Answered'])
        ->assertRedirect();

    $notification = $guest->unreadNotifications()->firstOrFail();

    expect($notification->data['type'])->toBe('inquiry')
        ->and($notification->data['url'])->toBe('/my-inquiries/'.$inquiry->id);
});

it('keeps resort administrator notifications scoped to their assigned resort', function () {
    $firstResort = notificationTestResort('First Resort');
    $secondResort = notificationTestResort('Second Resort');
    $firstAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $firstResort->id,
    ]);
    $secondAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $secondResort->id,
    ]);

    app(ResortAdminNotifier::class)->notifyForResort(
        $firstResort->id,
        'New inquiry',
        'A guest submitted an inquiry.',
        '/resort-admin/inquiries/1',
        'inquiry',
    );

    expect($firstAdmin->unreadNotifications()->count())->toBe(1)
        ->and($secondAdmin->unreadNotifications()->count())->toBe(0);

    $this->actingAs($secondAdmin)
        ->getJson('/notifications/feed')
        ->assertOk()
        ->assertJsonPath('unreadCount', 0)
        ->assertJsonMissing(['title' => 'New inquiry']);
});

it('notifies municipality admins when public tourism feedback is submitted', function () {
    $municipalityAdmin = User::factory()->create([
        'role' => 'municipality_admin',
    ]);
    $superAdmin = User::factory()->create([
        'role' => 'super_admin',
    ]);

    $this->from('/')
        ->post('/feedback', [
            'name' => 'A Visitor',
            'email' => 'visitor@example.com',
            'rating' => 5,
            'message' => 'I enjoyed exploring Abuyog.',
        ])
        ->assertRedirect('/');

    $notification = $municipalityAdmin->unreadNotifications()->firstOrFail();

    expect($notification->data['type'])->toBe('feedback')
        ->and($notification->data['url'])->toBe('/municipality-admin/feedback')
        ->and($superAdmin->unreadNotifications()->count())->toBe(0);
});

it('notifies other super admins when an administrator account is created', function () {
    $actor = User::factory()->create([
        'role' => 'super_admin',
    ]);
    $otherSuperAdmin = User::factory()->create([
        'role' => 'super_admin',
    ]);
    $resort = notificationTestResort();

    $this->actingAs($actor)
        ->post('/super-admin/accounts', [
            'name' => 'New Resort Admin',
            'email' => 'new-resort-admin@example.com',
            'role' => 'resort_admin',
            'resort_id' => $resort->id,
            'password' => 'secure-password',
        ])
        ->assertRedirect('/super-admin/accounts');

    expect($actor->unreadNotifications()->count())->toBe(0)
        ->and($otherSuperAdmin->unreadNotifications()->count())->toBe(1)
        ->and($otherSuperAdmin->unreadNotifications()->firstOrFail()->data['type'])->toBe('admin_account');
});

it('does not allow anonymous notification feed access', function () {
    $this->get('/notifications/feed')->assertRedirect('/login');
    $this->patchJson('/notifications/read-all')->assertUnauthorized();
});
