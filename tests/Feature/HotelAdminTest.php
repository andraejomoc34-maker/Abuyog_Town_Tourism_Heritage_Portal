<?php

use App\Models\Booking;
use App\Models\HotelRoom;
use App\Models\Resort;
use App\Models\User;
use Database\Seeders\AbuyogHotelSeeder;
use Illuminate\Support\Facades\Hash;

function createHotelForTest(string $name = 'Abuyog Hotel', string $type = 'hotel'): Resort
{
    return Resort::query()->create([
        'name' => $name,
        'description' => 'Hotel test property',
        'location' => 'Abuyog, Leyte',
        'image' => '/Abuyog-hotel.jpg',
        'status' => 'active',
        'property_type' => $type,
        'property_code' => $name === 'Abuyog Hotel' ? 'abuyog-hotel' : null,
    ]);
}

function createHotelAdminForTest(Resort $hotel): User
{
    return User::factory()->create([
        'name' => 'Abuyog Hotel Admin',
        'role' => 'hotel_admin',
        'resort_id' => $hotel->id,
    ]);
}

it('scopes the hotel admin dashboard data to Abuyog Hotel', function () {
    $hotel = createHotelForTest();
    $admin = createHotelAdminForTest($hotel);
    $guest = User::factory()->create();
    $room = HotelRoom::query()->create([
        'resort_id' => $hotel->id,
        'name' => 'Standard Room',
        'room_type' => 'Standard Room',
        'available_quantity' => 2,
        'status' => 'Available',
    ]);
    Booking::query()->create([
        'user_id' => $guest->id,
        'resort_id' => $hotel->id,
        'hotel_room_id' => $room->id,
        'booking_date' => today()->addDay(),
        'guests' => 2,
        'status' => 'Pending',
    ]);

    $this->actingAs($admin)
        ->get('/hotel-admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/HotelDashboard')
            ->where('hotel.name', 'Abuyog Hotel')
            ->where('stats.totalBookings', 1)
            ->where('stats.pendingBookings', 1)
            ->where('stats.availableRooms', 2));
});

it('denies non-hotel-admin roles access to hotel admin routes', function () {
    $hotel = createHotelForTest();

    $this->actingAs(User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $hotel->id,
    ]))
        ->get('/hotel-admin')
        ->assertForbidden();
});

it('does not grant hotel admins resort, municipality or super-admin access', function () {
    $hotel = createHotelForTest();
    $admin = createHotelAdminForTest($hotel);

    $this->actingAs($admin)
        ->get('/resort-admin')
        ->assertForbidden();

    $this->get('/municipality-admin')
        ->assertForbidden();

    $this->get('/super-admin/accounts')
        ->assertForbidden();
});

it('allows the assigned hotel admin to edit hotel details but not ownership or role', function () {
    $hotel = createHotelForTest();
    $otherHotel = createHotelForTest('Another Hotel');
    $admin = createHotelAdminForTest($hotel);

    $this->actingAs($admin)
        ->from('/hotel-admin/settings')
        ->patch('/hotel-admin/settings', [
            'name' => 'Abuyog Hotel Updated',
            'location' => 'Abuyog, Leyte',
            'description' => 'Updated hotel profile.',
            'contact_information' => null,
            'property_code' => 'another-hotel',
            'property_type' => 'resort',
            'resort_id' => $otherHotel->id,
            'role' => 'super_admin',
        ])
        ->assertRedirect('/hotel-admin/settings');

    $this->assertDatabaseHas('resorts', [
        'id' => $hotel->id,
        'name' => 'Abuyog Hotel Updated',
        'property_type' => 'hotel',
        'property_code' => 'abuyog-hotel',
    ]);
    $this->assertDatabaseHas('users', [
        'id' => $admin->id,
        'role' => 'hotel_admin',
        'resort_id' => $hotel->id,
    ]);

    $this->get('/hotel-admin')->assertOk();
});

it('does not allow hotel admins to view or manage bookings from another property', function () {
    $hotel = createHotelForTest();
    $otherProperty = createHotelForTest('Castañas Spring Resort', 'resort');
    $admin = createHotelAdminForTest($hotel);
    $room = HotelRoom::query()->create([
        'resort_id' => $otherProperty->id,
        'name' => 'Other property room',
        'room_type' => 'Other',
        'available_quantity' => 1,
        'status' => 'Available',
    ]);
    $booking = Booking::query()->create([
        'user_id' => User::factory()->create()->id,
        'resort_id' => $otherProperty->id,
        'hotel_room_id' => $room->id,
        'booking_date' => today()->addDay(),
        'guests' => 1,
        'status' => 'Pending',
    ]);

    $this->actingAs($admin)
        ->get('/hotel-admin/bookings/'.$booking->id)
        ->assertForbidden();

    $this->patch('/hotel-admin/bookings/'.$booking->id.'/status', ['status' => 'Confirmed'])
        ->assertForbidden();

    $this->put('/hotel-admin/rooms/'.$room->id, [
        'name' => 'Changed room',
        'room_type' => 'Other',
        'available_quantity' => 1,
        'status' => 'Available',
    ])->assertNotFound();

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'resort_id' => $otherProperty->id,
        'status' => 'Pending',
    ]);
});

it('creates a pending hotel room booking with a unique hotel reference', function () {
    $hotel = createHotelForTest();
    $guest = User::factory()->create(['contact_number' => '09171234567']);
    $room = HotelRoom::query()->create([
        'resort_id' => $hotel->id,
        'name' => 'Standard Room',
        'room_type' => 'Standard Room',
        'capacity' => 2,
        'available_quantity' => 1,
        'status' => 'Available',
        'price' => 2200,
    ]);

    $this->actingAs($guest)
        ->post('/resorts/'.$hotel->id.'/book', [
            'room_id' => $room->id,
            'booking_date' => today()->addDay()->toDateString(),
            'guests' => 2,
            'message' => 'Late arrival',
        ])
        ->assertRedirect();

    $booking = Booking::query()->sole();
    expect($booking->reference_number)->toMatch('/^ABY-HOTEL-\d{8}-\d{4}$/');
    expect($booking->status)->toBe('Pending')
        ->and($booking->resort_id)->toBe($hotel->id)
        ->and($booking->hotel_room_id)->toBe($room->id)
        ->and($booking->cottage_id)->toBeNull();
});

it('rejects a room belonging to a different property when making a hotel booking', function () {
    $hotel = createHotelForTest();
    $otherHotel = createHotelForTest('Other Hotel', 'hotel');
    $guest = User::factory()->create(['contact_number' => '09171234567']);
    $otherRoom = HotelRoom::query()->create([
        'resort_id' => $otherHotel->id,
        'name' => 'Other room',
        'room_type' => 'Standard',
        'available_quantity' => 1,
        'status' => 'Available',
    ]);

    $this->actingAs($guest)
        ->post('/resorts/'.$hotel->id.'/book', [
            'room_id' => $otherRoom->id,
            'booking_date' => today()->addDay()->toDateString(),
            'guests' => 1,
        ])
        ->assertSessionHasErrors('room_id');

    $this->assertDatabaseCount('bookings', 0);
});

it('creates the hotel, room types and demo admin idempotently', function () {
    $this->seed(AbuyogHotelSeeder::class);
    $this->seed(AbuyogHotelSeeder::class);

    $hotel = Resort::query()->where('name', 'Abuyog Hotel')->sole();
    $admin = User::query()->where('email', 'abuyoghotel.admin@abuyogtourism.test')->sole();

    expect($hotel->property_type)->toBe('hotel')
        ->and($hotel->status)->toBe('active')
        ->and($hotel->image)->toBe('/Abuyog-hotel.jpg')
        ->and($admin->role)->toBe('hotel_admin')
        ->and($admin->resort_id)->toBe($hotel->id)
        ->and(Hash::check('AbuyogHotel@12345', $admin->password))->toBeTrue();

    $this->assertDatabaseCount('hotel_rooms', 4);
});
