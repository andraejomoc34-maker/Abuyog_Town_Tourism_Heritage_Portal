<?php

use App\Models\Announcement;
use App\Models\Booking;
use App\Models\Cottage;
use App\Models\Feedback;
use App\Models\HotelRoom;
use App\Models\Resort;
use App\Models\User;
use Database\Seeders\EllenFuentesTravellersInnSeeder;
use Database\Seeders\FlorinaCountryLodgeSeeder;
use Database\Seeders\HabitatBudgetInnSeeder;
use Database\Seeders\VillageCondotelSeeder;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

it('prevents users from viewing another user\'s booking', function () {
    $owner = User::factory()->create(['role' => 'user']);
    $other = User::factory()->create(['role' => 'user']);
    $resort = Resort::create([
        'name' => 'Castañas Resort',
        'description' => 'Sample resort description.',
        'location' => 'Abuyog, Leyte',
        'image' => '/castanas.jpg',
        'status' => 'active',
    ]);

    $booking = Booking::create([
        'user_id' => $owner->id,
        'resort_id' => $resort->id,
        'booking_date' => now()->addDay()->toDateString(),
        'guests' => 2,
        'message' => 'Sample booking',
        'status' => 'Pending',
    ]);

    $this->actingAs($other)
        ->get('/bookings/'.$booking->id)
        ->assertForbidden();
});

it('restricts resort admins to their assigned resort bookings', function () {
    $adminResort = Resort::create([
        'name' => 'Castañas Resort',
        'description' => 'Sample resort description.',
        'location' => 'Abuyog, Leyte',
        'image' => '/castanas.jpg',
        'status' => 'active',
    ]);

    $otherResort = Resort::create([
        'name' => 'Another Resort',
        'description' => 'Other resort description.',
        'location' => 'Leyte',
        'image' => '/other.jpg',
        'status' => 'active',
    ]);

    $admin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $adminResort->id,
    ]);

    $booking = Booking::create([
        'user_id' => User::factory()->create()->id,
        'resort_id' => $otherResort->id,
        'booking_date' => now()->addDay()->toDateString(),
        'guests' => 3,
        'message' => 'Other resort booking',
        'status' => 'Pending',
    ]);

    $this->actingAs($admin)
        ->get('/admin/resort/bookings/'.$booking->id)
        ->assertForbidden();
});

it('generates a booking reference number and keeps the booking assigned to the resort admin', function () {
    $resort = Resort::create([
        'name' => 'Another Resort',
        'description' => 'Sample resort description.',
        'location' => 'Abuyog, Leyte',
        'image' => '/castanas.jpg',
        'status' => 'active',
    ]);

    $admin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $resort->id,
    ]);

    $booking = Booking::create([
        'user_id' => User::factory()->create()->id,
        'resort_id' => $resort->id,
        'booking_date' => now()->addDay()->toDateString(),
        'guests' => 2,
        'message' => 'Reference generation check',
        'status' => 'Pending',
    ]);

    expect($booking->reference_number ?? null)->toMatch('/^ABY-\d{8}-\d{4}$/');

    $this->actingAs($admin)
        ->get('/admin/resort/bookings/'.$booking->id)
        ->assertOk();
});

it('prevents inquiries for unavailable resorts', function () {
    $user = User::factory()->create();
    $resort = Resort::create([
        'name' => 'Closed Resort',
        'description' => 'Temporarily closed.',
        'location' => 'Abuyog, Leyte',
        'image' => '/closed.jpg',
        'status' => 'inactive',
    ]);

    $this->actingAs($user)
        ->get('/resorts/'.$resort->id.'/inquire')
        ->assertRedirect('/resorts/'.$resort->id)
        ->assertSessionHas('error', 'This resort is currently unavailable.');
});

it('keeps public accommodations listed and offers booking only for Abuyog Hotel', function () {
    $castanas = Resort::create([
        'name' => 'Castañas Spring Resort',
        'description' => 'Castañas details.',
        'location' => 'Abuyog, Leyte',
        'image' => '/castanas.jpg',
        'status' => 'active',
        'property_type' => 'resort',
        'property_code' => 'castanas-spring-resort',
    ]);
    $valida = Resort::create([
        'name' => 'VALIDA MAKABLACK RESORT',
        'description' => 'VALIDA details.',
        'location' => 'Abuyog, Leyte',
        'image' => '/valida.jpg',
        'status' => 'active',
        'property_type' => 'resort',
        'property_code' => 'valida-makablack-resort',
    ]);
    $falls = Resort::create([
        'name' => 'Malaguicay Falls',
        'description' => 'Nature destination.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
        'property_type' => 'nature',
    ]);
    $hotel = Resort::create([
        'name' => 'Abuyog Hotel',
        'description' => 'Hotel details.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
        'property_type' => 'hotel',
        'property_code' => 'abuyog-hotel',
    ]);
    HotelRoom::query()->create([
        'resort_id' => $hotel->id,
        'name' => 'Standard Room',
        'room_type' => 'Standard Room',
        'available_quantity' => 1,
        'status' => 'Available',
    ]);
    $this->seed(VillageCondotelSeeder::class);
    $this->seed(HabitatBudgetInnSeeder::class);
    $this->seed(FlorinaCountryLodgeSeeder::class);
    $this->seed(EllenFuentesTravellersInnSeeder::class);
    $habitat = Resort::query()->where('property_code', 'habitat-budget-inn')->sole();
    $florina = Resort::query()->where('property_code', 'florina-country-lodge')->sole();
    $ellen = Resort::query()->where('property_code', 'ellen-fuentes-travellers-inn')->sole();

    $this->get('/resorts')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('resorts', 8)
            ->where('resorts.0.name', 'Malaguicay Falls')
            ->where('resorts.0.can_book', false)
            ->where('resorts.1.name', 'Castañas Spring Resort')
            ->where('resorts.1.can_book', false)
            ->where('resorts.2.name', 'VALIDA MAKABLACK RESORT')
            ->where('resorts.2.can_book', false)
            ->where('resorts.3.name', 'Abuyog Hotel')
            ->where('resorts.3.can_book', true)
            ->where('resorts.4.name', 'THE VILLAGE CONDOTEL')
            ->where('resorts.4.can_book', false)
            ->where('resorts.5.name', 'HABITAT BUDGET INN')
            ->where('resorts.5.property_type', 'budget_accommodation')
            ->where('resorts.5.can_book', false)
            ->where('resorts.6.name', 'Florina Country Lodge')
            ->where('resorts.6.property_type', 'lodge')
            ->where('resorts.6.can_book', false)
            ->where('resorts.7.name', "ELLEN FUENTES TRAVELLER'S INN")
            ->where('resorts.7.property_type', 'inn')
            ->where('resorts.7.can_book', false));

    foreach ([$castanas, $valida, $falls] as $resort) {
        $this->get('/resorts/'.$resort->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('resort.name', $resort->name)
                ->where('canBook', false));
    }

    $this->get('/resorts/'.$hotel->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('canBook', true));

    $this->get('/resorts/'.$habitat->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resort.name', 'HABITAT BUDGET INN')
            ->where('resort.location', 'Abuyog, Leyte')
            ->where('canBook', false));

    $this->get('/resorts/'.$florina->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resort.name', 'Florina Country Lodge')
            ->where('resort.location', 'National Highway, Guintagbucan, Abuyog, Leyte')
            ->where('canBook', false));

    $this->get('/resorts/'.$ellen->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resort.name', "ELLEN FUENTES TRAVELLER'S INN")
            ->where('resort.location', 'Maharlika Highway, Guintagbucan, Abuyog, Leyte')
            ->where('canBook', false));
});

it('publishes Ellen Fuentes Traveller\'s Inn and blocks booking and admin access', function () {
    $this->seed(EllenFuentesTravellersInnSeeder::class);
    $this->seed(EllenFuentesTravellersInnSeeder::class);

    $ellen = Resort::query()
        ->where('property_code', 'ellen-fuentes-travellers-inn')
        ->sole();

    expect(Resort::query()->where('name', "ELLEN FUENTES TRAVELLER'S INN")->count())->toBe(1)
        ->and($ellen->property_type)->toBe('inn')
        ->and($ellen->image)->toBe('/Fuentes.jpg')
        ->and($ellen->location)->toBe('Maharlika Highway, Guintagbucan, Abuyog, Leyte')
        ->and($ellen->contact_information)->toContain(
            'Contact: 09526234424',
            "Facebook: Ellen Fuentes Traveller's Inn",
            'Google Address: Q243+5Wh, Abuyog, Leyte, Philippines',
        )
        ->and($ellen->price_information)->toContain(
            '24 hours — ₱1,200',
            '12 hours — ₱900',
            '6 hours — ₱700',
            '24 hours — ₱900',
            '12 hours — ₱700',
            '6 hours — ₱500',
            'Room No. 189',
            'Room 1 — ₱1,400',
            'Room 2 — ₱1,400',
            'Extension: ₱150 per hour',
            'Extra Bed: ₱250',
            'Senior Citizen Discount: 20%',
            'Please provide ID for verification.',
        )
        ->and($ellen->isBookable())->toBeFalse()
        ->and($ellen->hasResortAdminAccess())->toBeFalse();

    $this->assertFileExists(public_path('Fuentes.jpg'));
    $this->assertFileExists(public_path('Fuentes-room.jpg'));

    $this->get('/resorts/'.$ellen->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resort.name', "ELLEN FUENTES TRAVELLER'S INN")
            ->where('resort.property_type', 'inn')
            ->where('canBook', false));

    $customer = User::factory()->create([
        'role' => 'user',
        'contact_number' => '09123456789',
    ]);

    $this->actingAs($customer)
        ->get('/resorts/'.$ellen->id.'/book')
        ->assertForbidden();

    $this->post('/resorts/'.$ellen->id.'/book', [
        'booking_date' => today()->addDay()->toDateString(),
        'guests' => 2,
    ])->assertForbidden();

    $ellenAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $ellen->id,
    ]);

    $this->actingAs($ellenAdmin)
        ->get('/resort-admin')
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('publishes Florina Country Lodge information and blocks booking and admin access', function () {
    $this->seed(FlorinaCountryLodgeSeeder::class);
    $this->seed(FlorinaCountryLodgeSeeder::class);

    $florina = Resort::query()
        ->where('property_code', 'florina-country-lodge')
        ->sole();

    expect(Resort::query()->where('name', 'Florina Country Lodge')->count())->toBe(1)
        ->and($florina->description)->toBe('Florina Country Lodge is an accommodation option located along National Highway in Guintagbucan, Abuyog, Leyte.')
        ->and($florina->property_type)->toBe('lodge')
        ->and($florina->image)->toBe('/Florida.jpg')
        ->and($florina->contact_information)->toBe('0927-696-6646')
        ->and($florina->price_information)->toContain(
            'Rates shown from the provided accommodation information.',
            '2:00 PM check-in — ₱1,800',
            '12:00 noon check-out with free breakfast — ₱2,000',
            '2:00 PM check-in — ₱1,500',
            '12:00 noon check-out with free breakfast — ₱1,700',
            '2:00 PM check-in — ₱1,100',
            '12:00 noon check-out with free breakfast — ₱1,300',
            '12 hours — ₱350',
            '24 hours — ₱450',
            'Extra Person — ₱100 per head',
            'Extra Bed/Person — ₱100 / ₱200',
            'Early Check-In — ₱100/hour',
            'Late Check-Out — ₱100/hour',
        )
        ->and($florina->isBookable())->toBeFalse()
        ->and($florina->hasResortAdminAccess())->toBeFalse();

    $this->assertFileExists(public_path('Florida.jpg'));
    $this->assertFileExists(public_path('Florida-room.jpg'));

    $this->get('/resorts/'.$florina->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resort.name', 'Florina Country Lodge')
            ->where('resort.property_type', 'lodge')
            ->where('canBook', false));

    $customer = User::factory()->create([
        'role' => 'user',
        'contact_number' => '09123456789',
    ]);

    $this->actingAs($customer)
        ->get('/resorts/'.$florina->id.'/book')
        ->assertForbidden();

    $this->post('/resorts/'.$florina->id.'/book', [
        'booking_date' => today()->addDay()->toDateString(),
        'guests' => 2,
    ])->assertForbidden();

    $florinaAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $florina->id,
    ]);

    $this->actingAs($florinaAdmin)
        ->get('/resort-admin')
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('publishes Habitat Budget Inn information and blocks booking and admin access', function () {
    $this->seed(HabitatBudgetInnSeeder::class);

    $habitat = Resort::query()
        ->where('property_code', 'habitat-budget-inn')
        ->sole();
    $imageFiles = [
        'Habitat.jpg',
        'Habitat-1.jpg',
        'Habitat-room.jpg',
        'Habitat-room-1.jpg',
    ];

    expect($habitat->description)->toBe('HABITAT BUDGET INN is a budget accommodation option in Abuyog, Leyte offering lodging and boarding options.')
        ->and($habitat->property_type)->toBe('budget_accommodation')
        ->and($habitat->image)->toBe('/Habitat.jpg')
        ->and($habitat->contact_information)->toBe('09984398427')
        ->and($habitat->price_information)->toContain('₱300 / day', '₱2,500 / person', 'not been independently verified')
        ->and($habitat->isBookable())->toBeFalse()
        ->and($habitat->hasResortAdminAccess())->toBeFalse();

    foreach ($imageFiles as $imageFile) {
        $this->assertFileExists(public_path($imageFile));
    }

    $this->get('/resorts/'.$habitat->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resort.name', 'HABITAT BUDGET INN')
            ->where('resort.property_type', 'budget_accommodation')
            ->where('canBook', false));

    $customer = User::factory()->create([
        'role' => 'user',
        'contact_number' => '09984398427',
    ]);

    $this->actingAs($customer)
        ->get('/resorts/'.$habitat->id.'/book')
        ->assertForbidden();

    $this->post('/resorts/'.$habitat->id.'/book', [
        'booking_date' => today()->addDay()->toDateString(),
        'guests' => 1,
    ])->assertForbidden();

    $habitatAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $habitat->id,
    ]);

    $this->actingAs($habitatAdmin)
        ->get('/resort-admin')
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('publishes The Village Condotel as a view-only public accommodation', function () {
    $this->seed(VillageCondotelSeeder::class);
    $this->seed(VillageCondotelSeeder::class);

    $village = Resort::query()
        ->where('property_code', 'village-condotel')
        ->sole();

    expect(Resort::query()->where('name', 'THE VILLAGE CONDOTEL')->count())->toBe(1)
        ->and($village->property_type)->toBe('condotel')
        ->and($village->image)->toBe('/The village.jpg')
        ->and($village->contact_information)->toContain('Steve Sepulveda', '09532202901')
        ->and($village->price_information)->toContain('₱3,800.00', '₱3,500.00', '₱3,000.00', '₱2,350.00', '₱800.00')
        ->and($village->hasResortAdminAccess())->toBeFalse()
        ->and($village->isBookable())->toBeFalse();

    $this->get('/resorts')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resorts.0.name', 'THE VILLAGE CONDOTEL')
            ->where('resorts.0.property_type', 'condotel')
            ->where('resorts.0.can_book', false));

    $this->get('/resorts/'.$village->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('resort.name', 'THE VILLAGE CONDOTEL')
            ->where('resort.location', 'Abuyog, Leyte')
            ->where('canBook', false));

    $customer = User::factory()->create([
        'role' => 'user',
        'contact_number' => '09171234567',
    ]);

    $this->actingAs($customer)
        ->get('/resorts/'.$village->id.'/book')
        ->assertForbidden();

    $this->post('/resorts/'.$village->id.'/book', [
        'booking_date' => today()->addDay()->toDateString(),
        'guests' => 2,
        'quantity' => 1,
    ])->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects direct Castañas and VALIDA booking requests without creating records', function () {
    $resorts = collect([
        ['name' => 'Castañas Spring Resort', 'code' => 'castanas-spring-resort'],
        ['name' => 'VALIDA MAKABLACK RESORT', 'code' => 'valida-makablack-resort'],
    ])->map(fn (array $property): Resort => Resort::query()->create([
        'name' => $property['name'],
        'description' => 'Public property details.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
        'property_type' => 'resort',
        'property_code' => $property['code'],
    ]));
    $customer = User::factory()->create([
        'role' => 'user',
        'contact_number' => '09171234567',
    ]);

    foreach ($resorts as $resort) {
        $this->actingAs($customer)
            ->get('/resorts/'.$resort->id.'/book')
            ->assertForbidden();

        $this->post('/resorts/'.$resort->id.'/book', [
            'booking_date' => today()->addDay()->toDateString(),
            'guests' => 2,
            'cottage_id' => 1,
            'quantity' => 1,
        ])->assertForbidden();
    }

    $this->assertDatabaseCount('bookings', 0);
});

it('blocks resort admin routes only for Castañas Spring Resort and VALIDA', function () {
    foreach ([
        ['Castañas Spring Resort', 'castanas-spring-resort'],
        ['VALIDA MAKABLACK RESORT', 'valida-makablack-resort'],
    ] as [$name, $code]) {
        $resort = Resort::query()->create([
            'name' => $name,
            'description' => 'Public resort details.',
            'location' => 'Abuyog, Leyte',
            'status' => 'active',
            'property_type' => 'resort',
            'property_code' => $code,
        ]);
        $admin = User::factory()->create([
            'role' => 'resort_admin',
            'resort_id' => $resort->id,
        ]);

        $this->actingAs($admin)
            ->get('/resort-admin')
            ->assertForbidden();
        $this->get('/resort-admin/bookings')->assertForbidden();
        $this->get('/resort-admin/cottages')->assertForbidden();
        $this->get('/admin/resort/dashboard')->assertForbidden();
    }

    $otherResort = Resort::query()->create([
        'name' => 'Other Resort',
        'description' => 'Other property.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $otherAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $otherResort->id,
    ]);

    $this->actingAs($otherAdmin)
        ->get('/resort-admin')
        ->assertOk();
});

it('uses Pending as the default inquiry status in the database schema', function () {
    $user = User::factory()->create();
    $resort = Resort::create([
        'name' => 'Status Check Resort',
        'description' => 'Used to validate inquiry status defaults.',
        'location' => 'Abuyog, Leyte',
        'image' => '/status-check.jpg',
        'status' => 'active',
    ]);

    DB::table('inquiries')->insert([
        'user_id' => $user->id,
        'resort_id' => $resort->id,
        'message' => 'Checking the inquiry default status.',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(DB::table('inquiries')->latest('id')->value('status'))->toBe('Pending');
});

it('blocks resort admins from viewing another resort booking even when they own the booking', function () {
    $castanas = Resort::create([
        'name' => 'Managed Resort',
        'description' => 'Castañas.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $valida = Resort::create([
        'name' => 'Other Resort',
        'description' => 'Valida.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $castanasAdmin = User::factory()->create([
        'email' => 'castanas.admin@abuyogtourism.test',
        'role' => 'resort_admin',
        'resort_id' => $castanas->id,
    ]);
    $booking = Booking::create([
        'user_id' => $castanasAdmin->id,
        'resort_id' => $valida->id,
        'booking_date' => now()->addDay()->toDateString(),
        'guests' => 1,
        'status' => 'Pending',
    ]);

    $this->actingAs($castanasAdmin)
        ->get('/resort-admin/bookings/'.$booking->id)
        ->assertForbidden();
});

it('blocks resort admin cottage changes and rejects customer cottage bookings for disabled resorts', function () {
    $castanas = Resort::create([
        'name' => 'Castañas Spring Resort',
        'description' => 'Castañas.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $valida = Resort::create([
        'name' => 'VALIDA MAKABLACK RESORT',
        'description' => 'Valida.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $castanasCottage = Cottage::create([
        'resort_id' => $castanas->id,
        'name' => 'Castañas Cottage',
        'capacity' => 4,
        'quantity' => 2,
        'status' => 'Available',
    ]);
    $validaCottage = Cottage::create([
        'resort_id' => $valida->id,
        'name' => 'Valida Cottage',
        'capacity' => 4,
        'quantity' => 2,
        'status' => 'Available',
    ]);
    $castanasAdmin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $castanas->id,
    ]);

    $this->actingAs($castanasAdmin)
        ->put('/resort-admin/cottages/'.$validaCottage->id, [
            'name' => 'Hijacked Cottage',
            'capacity' => 4,
            'quantity' => 2,
            'status' => 'Available',
        ])
        ->assertForbidden();

    $customer = User::factory()->create([
        'role' => 'user',
        'contact_number' => '09171234567',
    ]);
    $forgedOwner = User::factory()->create(['role' => 'user']);
    $bookingDate = now()->addDays(5)->toDateString();

    $this->actingAs($customer)
        ->post('/resorts/'.$castanas->id.'/book', [
            'cottage_id' => $validaCottage->id,
            'booking_date' => $bookingDate,
            'guests' => 2,
            'quantity' => 1,
        ])
        ->assertForbidden();

    $this->post('/resorts/'.$castanas->id.'/book', [
        'cottage_id' => $castanasCottage->id,
        'booking_date' => $bookingDate,
        'guests' => 2,
        'quantity' => 1,
        'user_id' => $forgedOwner->id,
        'resort_id' => $valida->id,
        'reference_number' => 'FORGED-REFERENCE',
    ])->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects cottage bookings for non-hotel accommodations', function () {
    $resort = Resort::create([
        'name' => 'Capacity Resort',
        'description' => 'Capacity test.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $cottage = Cottage::create([
        'resort_id' => $resort->id,
        'name' => 'Single Cottage',
        'capacity' => 2,
        'quantity' => 1,
        'status' => 'Available',
    ]);
    $firstCustomer = User::factory()->create(['role' => 'user', 'contact_number' => '09171111111']);
    $secondCustomer = User::factory()->create(['role' => 'user', 'contact_number' => '09172222222']);
    $bookingDate = now()->addDays(7)->toDateString();
    $payload = [
        'cottage_id' => $cottage->id,
        'booking_date' => $bookingDate,
        'guests' => 3,
        'quantity' => 1,
    ];

    $this->actingAs($firstCustomer)
        ->post('/resorts/'.$resort->id.'/book', $payload)
        ->assertForbidden();

    $this->actingAs($secondCustomer)
        ->post('/resorts/'.$resort->id.'/book', $payload)
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('keeps each resort guest booking history limited to that resort', function () {
    $castanas = Resort::create([
        'name' => 'Guest History Resort A',
        'description' => 'Castañas.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $valida = Resort::create([
        'name' => 'Guest History Resort B',
        'description' => 'Valida.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $guest = User::factory()->create(['role' => 'user']);
    $castanasBooking = Booking::create([
        'user_id' => $guest->id,
        'resort_id' => $castanas->id,
        'reference_number' => 'ABY-20261004-8001',
        'booking_date' => now()->addDay()->toDateString(),
        'guests' => 2,
        'status' => 'Confirmed',
    ]);
    Booking::create([
        'user_id' => $guest->id,
        'resort_id' => $valida->id,
        'reference_number' => 'ABY-20261004-8002',
        'booking_date' => now()->addDays(2)->toDateString(),
        'guests' => 2,
        'status' => 'Confirmed',
    ]);
    $castanasAdmin = User::factory()->create(['role' => 'resort_admin', 'resort_id' => $castanas->id]);
    $validaAdmin = User::factory()->create(['role' => 'resort_admin', 'resort_id' => $valida->id]);

    $this->actingAs($castanasAdmin)
        ->get('/resort-admin/guests/'.$guest->id)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Guests/Show')
            ->has('bookings', 1)
            ->where('bookings.0.reference_number', $castanasBooking->reference_number));

    $this->actingAs($validaAdmin)
        ->get('/resort-admin/guests/'.$guest->id)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Guests/Show')
            ->has('bookings', 1)
            ->where('bookings.0.reference_number', 'ABY-20261004-8002'));
});

it('shows only resort feedback to resort admins while municipality and super admins retain all feedback', function () {
    $castanas = Resort::create([
        'name' => 'Feedback Resort A',
        'description' => 'Castañas.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $valida = Resort::create([
        'name' => 'Feedback Resort B',
        'description' => 'Valida.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $guest = User::factory()->create(['role' => 'user']);

    foreach ([[$castanas->id, 'Castañas review'], [$valida->id, 'Valida review'], [null, 'General feedback']] as [$resortId, $message]) {
        Feedback::create([
            'user_id' => $guest->id,
            'resort_id' => $resortId,
            'name' => $guest->name,
            'email' => $guest->email,
            'rating' => 5,
            'message' => $message,
            'status' => 'pending',
        ]);
    }

    $castanasAdmin = User::factory()->create(['role' => 'resort_admin', 'resort_id' => $castanas->id]);
    $this->actingAs($castanasAdmin)
        ->get('/resort-admin/reviews')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reviews/Index')
            ->has('reviews', 1)
            ->where('reviews.0.message', 'Castañas review'));

    $this->actingAs(User::factory()->create(['role' => 'municipality_admin']))
        ->get('/municipality-admin/feedback')
        ->assertInertia(fn (Assert $page) => $page->has('feedback', 3));

    $this->actingAs(User::factory()->create(['role' => 'super_admin']))
        ->get('/super-admin/feedback')
        ->assertInertia(fn (Assert $page) => $page->has('feedback', 3));
});

it('keeps resort announcements separate from municipality announcements and enforces ownership', function () {
    $castanas = Resort::create([
        'name' => 'Announcements Resort A',
        'description' => 'Castañas.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $valida = Resort::create([
        'name' => 'Announcements Resort B',
        'description' => 'Valida.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $castanasAdmin = User::factory()->create(['role' => 'resort_admin', 'resort_id' => $castanas->id]);
    $municipalityAdmin = User::factory()->create(['role' => 'municipality_admin']);
    $globalAnnouncement = Announcement::create([
        'title' => 'Municipal Notice',
        'slug' => 'municipal-notice',
        'content' => 'Municipality-wide notice.',
        'category' => 'Public Notice',
        'status' => 'Draft',
        'created_by' => $municipalityAdmin->id,
    ]);
    $castanasAnnouncement = Announcement::create([
        'title' => 'Castañas Update',
        'slug' => 'castanas-update',
        'content' => 'Resort update.',
        'category' => 'Resort Update',
        'status' => 'Draft',
        'created_by' => $castanasAdmin->id,
        'resort_id' => $castanas->id,
    ]);
    $validaAnnouncement = Announcement::create([
        'title' => 'Valida Update',
        'slug' => 'valida-update',
        'content' => 'Other resort update.',
        'category' => 'Resort Update',
        'status' => 'Draft',
        'created_by' => User::factory()->create(['role' => 'resort_admin', 'resort_id' => $valida->id])->id,
        'resort_id' => $valida->id,
    ]);

    $this->actingAs($castanasAdmin)
        ->get('/resort-admin/announcements')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Announcements/Index')
            ->has('announcements', 1)
            ->where('announcements.0.title', 'Castañas Update'));

    $this->get('/resort-admin/announcements/'.$globalAnnouncement->id.'/edit')->assertForbidden();
    $this->get('/resort-admin/announcements/'.$validaAnnouncement->id.'/edit')->assertForbidden();

    $this->actingAs($municipalityAdmin)
        ->get('/municipality-admin/announcements')
        ->assertInertia(fn (Assert $page) => $page
            ->has('announcements', 1)
            ->where('announcements.0.title', 'Municipal Notice'));

    $this->actingAs($castanasAdmin)->post('/resort-admin/announcements', [
        'title' => 'New Castañas Notice',
        'content' => 'A resort-only notice.',
        'category' => 'Resort Update',
        'status' => 'Draft',
        'resort_id' => $valida->id,
    ])->assertRedirect('/resort-admin/announcements');

    $this->assertDatabaseHas('announcements', [
        'title' => 'New Castañas Notice',
        'resort_id' => $castanas->id,
    ]);
});

it('limits resort settings updates to the assigned resort profile fields', function () {
    $castanas = Resort::create([
        'name' => 'Settings Resort A',
        'description' => 'Before update.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $valida = Resort::create([
        'name' => 'Settings Resort B',
        'description' => 'Valida.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $admin = User::factory()->create([
        'role' => 'resort_admin',
        'resort_id' => $castanas->id,
    ]);

    $this->actingAs($admin)
        ->patch('/resort-admin/settings', [
            'name' => 'Castañas Updated',
            'location' => 'Updated Location',
            'description' => 'Updated resort profile.',
            'contact_information' => '09170000000',
            'role' => 'super_admin',
            'resort_id' => $valida->id,
        ])
        ->assertRedirect('/resort-admin/settings');

    $this->assertDatabaseHas('resorts', [
        'id' => $castanas->id,
        'name' => 'Castañas Updated',
        'location' => 'Updated Location',
    ]);
    $this->assertDatabaseHas('resorts', [
        'id' => $valida->id,
        'name' => 'Settings Resort B',
    ]);
    $this->assertDatabaseHas('users', [
        'id' => $admin->id,
        'role' => 'resort_admin',
        'resort_id' => $castanas->id,
    ]);
});

it('automatically associates completed booking feedback with its resort and prevents duplicate reviews', function () {
    $resort = Resort::create([
        'name' => 'Feedback Association Resort A',
        'description' => 'Review association.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $otherResort = Resort::create([
        'name' => 'Feedback Association Resort B',
        'description' => 'Other resort.',
        'location' => 'Abuyog, Leyte',
        'status' => 'active',
    ]);
    $guest = User::factory()->create(['role' => 'user']);
    $booking = Booking::create([
        'user_id' => $guest->id,
        'resort_id' => $resort->id,
        'booking_date' => now()->subDay()->toDateString(),
        'guests' => 2,
        'status' => 'Completed',
    ]);

    $this->actingAs($guest)
        ->post('/bookings/'.$booking->id.'/feedback', [
            'rating' => 5,
            'message' => 'A lovely stay.',
            'resort_id' => $otherResort->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('feedback', [
        'booking_id' => $booking->id,
        'resort_id' => $resort->id,
        'user_id' => $guest->id,
        'message' => 'A lovely stay.',
    ]);

    $this->post('/bookings/'.$booking->id.'/feedback', [
        'rating' => 4,
        'message' => 'Duplicate review.',
    ])->assertSessionHas('error');

    $this->assertDatabaseCount('feedback', 1);
});
