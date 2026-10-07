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
        $hotel = Resort::query()->firstOrCreate(
            ['property_code' => 'abuyog-hotel'],
            [
                'name' => 'Abuyog Hotel',
                'description' => 'Comfortable hotel accommodation in Abuyog, Leyte.',
                'location' => 'Abuyog, Leyte',
                'image' => '/Abuyog-hotel.jpg',
                'image_url' => '/Abuyog-hotel.jpg',
                'contact_information' => null,
                'amenities' => null,
                'price_information' => 'Room rates shown are transcribed from the provided brochure and have not been confirmed as current. The brochure also lists single extra bed at PHP 300.00 and double extra bed at PHP 600.00; confirm all rates with the hotel.',
                'status' => 'active',
                'property_type' => 'hotel',
                'property_code' => 'abuyog-hotel',
            ],
        );
        if ($hotel->property_type !== 'hotel') {
            $hotel->update(['property_type' => 'hotel']);
        }

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
