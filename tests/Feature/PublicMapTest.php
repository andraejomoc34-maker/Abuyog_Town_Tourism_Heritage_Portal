<?php

use App\Models\Resort;
use App\Models\TouristSpot;
use Inertia\Testing\AssertableInertia as Assert;

test('the public map only exposes active records with their available visitor details', function () {
    $resort = Resort::query()->create([
        'name' => 'Abuyog Hotel',
        'description' => 'A place to stay in town.',
        'location' => 'Avenida Rizal Street, Abuyog, Leyte',
        'image_url' => '/Abuyog-hotel.jpg',
        'contact_information' => 'Phone: 09276030650',
        'amenities' => ['Wi-Fi', 'Parking'],
        'price_information' => 'Rates vary by room.',
        'property_type' => 'hotel',
        'status' => 'active',
    ]);
    Resort::query()->create([
        'name' => 'Inactive Stay',
        'status' => 'inactive',
    ]);

    $spot = TouristSpot::query()->create([
        'name' => 'Abuyog Coastal View',
        'description' => 'A view of the coast.',
        'location' => 'Abuyog, Leyte',
        'category' => 'Nature',
        'image_url' => '/abuyog-2.jpg',
        'status' => 'active',
    ]);
    TouristSpot::query()->create([
        'name' => 'Inactive Attraction',
        'status' => 'inactive',
    ]);

    $this->get(route('map', ['search' => '  CoAsTaL   view  ']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('map')
            ->where('search', 'CoAsTaL   view')
            ->has('resorts', 1)
            ->where('resorts.0.id', $resort->id)
            ->where('resorts.0.location', 'Avenida Rizal Street, Abuyog, Leyte')
            ->where('resorts.0.image_url', '/Abuyog-hotel.jpg')
            ->where('resorts.0.contact_information', 'Phone: 09276030650')
            ->where('resorts.0.amenities', ['Wi-Fi', 'Parking'])
            ->where('resorts.0.price_information', 'Rates vary by room.')
            ->where('resorts.0.property_type', 'hotel')
            ->has('touristSpots', 1)
            ->where('touristSpots.0.id', $spot->id)
            ->where('touristSpots.0.category', 'Nature')
            ->where('touristSpots.0.image_url', '/abuyog-2.jpg'));
});
