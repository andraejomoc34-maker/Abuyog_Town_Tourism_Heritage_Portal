<?php

namespace Database\Seeders;

use App\Models\HotelRoom;
use App\Models\Resort;
use App\Models\User;
use Illuminate\Database\Seeder;

class AbuyogHotelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hotel = Resort::query()
            ->where('property_code', 'abuyog-hotel')
            ->first()
            ?? Resort::query()->where('name', 'Abuyog Hotel')->first()
            ?? new Resort;

        $hotel->fill([
            'name' => 'Abuyog Hotel',
            'description' => 'Abuyog Hotel is located on Avenida Rizal Street in Abuyog, Leyte, Philippines.',
            'location' => 'Avenida Rizal Street, Abuyog, Leyte, Philippines',
            'image' => $hotel->image ?: '/Abuyog-hotel.jpg',
            'image_url' => $hotel->image_url ?: '/Abuyog-hotel.jpg',
            'contact_information' => "Phone: 09276030650\nEmail: abuyoghotel111@gmail.com",
            'amenities' => [
                'Comfortable Beds',
                'In-Room Wi-Fi',
                'Parking Area',
                'Lounge',
                'Restaurant',
                'Function Hall',
                'Free Breakfast',
                'Complimentary Supplies',
            ],
            'status' => $hotel->status ?: 'active',
            'property_type' => 'hotel',
            'property_code' => 'abuyog-hotel',
        ])->save();

        $roomTypes = [
            ['Standard Room', 2200, '/Abuyog-hotel-room.jpg'],
            ['Superior Suite Room', 2965, '/Abuyog-hotel-room-1.jpg'],
            ['Executive Room', 2526, null],
            ['Executive Suite Room', 3294, null],
        ];

        foreach ($roomTypes as [$name, $price, $image]) {
            HotelRoom::query()->firstOrCreate(
                ['resort_id' => $hotel->id, 'room_type' => $name],
                [
                    'name' => $name,
                    'description' => 'Brochure rate; confirm current pricing with the hotel.',
                    'capacity' => null,
                    'price' => $price,
                    'available_quantity' => 0,
                    'status' => 'Unavailable',
                    'image' => $image,
                ],
            );
        }

        User::query()->updateOrCreate(
            ['email' => 'abuyoghotel.admin@abuyogtourism.test'],
            [
                'name' => 'Abuyog Hotel Admin',
                'password' => 'AbuyogHotel@12345',
                'role' => 'hotel_admin',
                'resort_id' => $hotel->id,
                'is_active' => true,
            ],
        );
    }
}
