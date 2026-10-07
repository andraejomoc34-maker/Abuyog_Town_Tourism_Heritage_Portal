<?php

namespace Database\Seeders;

use App\Models\Resort;
use Illuminate\Database\Seeder;

class VillageCondotelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resort = Resort::query()->firstOrNew([
            'property_code' => 'village-condotel',
        ]);

        if (! $resort->exists) {
            $resort = Resort::query()->firstOrNew([
                'name' => 'THE VILLAGE CONDOTEL',
            ]);
        }

        $resort->fill([
            'name' => 'THE VILLAGE CONDOTEL',
            'description' => 'THE VILLAGE CONDOTEL offers furnished accommodation units in Abuyog, Leyte, with several unit options for different group sizes. Room features and rates are based on the provided accommodation rate information.',
            'location' => 'Abuyog, Leyte',
            'image' => '/The village.jpg',
            'image_url' => '/The village.jpg',
            'contact_information' => "Manager: Steve Sepulveda\nContact Number: 09532202901",
            'amenities' => null,
            'price_information' => implode("\n", [
                'Rates and unit details are based on the provided rate-board image and have not been independently verified as current official rates.',
                '',
                'EXECUTIVE-FAMILY UNIT — ₱3,800.00',
                '3 Bedrooms & 2 Bathrooms',
                'Maximum 6 occupants',
                'Fully furnished',
                'Air-conditioned rooms',
                'Hot & cold shower',
                'Free access to swimming pool',
                '',
                'ELEGANT SUITE UNIT — ₱3,500.00',
                '1 Bedroom & 1 Bathroom',
                '2 Queen size beds',
                'Maximum 4 occupants',
                'Fully furnished',
                'Air-conditioned rooms',
                'Hot & cold shower',
                'Free access to swimming pool',
                '',
                'PREMIER LUXURY UNIT — ₱3,000.00',
                '1 Bedroom & 1 Bathroom',
                'Queen size bed',
                'Maximum 3 occupants',
                'Fully furnished',
                'Air-conditioned rooms',
                'Hot & cold shower',
                'Free access to swimming pool',
                'Netflix & YouTube access / Wi-Fi included',
                '',
                'DELUXE LUXURY UNIT — ₱2,350.00',
                '1 Bedroom & 1 Bathroom',
                'Full size bed',
                'Maximum 2 occupants',
                'Fully furnished',
                'Air-conditioned rooms',
                'Hot & cold shower',
                'Netflix & YouTube access / Wi-Fi included',
                '',
                'FUNCTION ROOM — ₱800.00 per hour',
                'Minimum booking of 3 hours',
                '75-inch big screen TV',
                'Sing-along entertainment system',
                'Premium speaker for clear high-quality sound',
                'Standby 25-kVA generator',
            ]),
            'status' => 'active',
            'property_type' => 'condotel',
            'property_code' => 'village-condotel',
        ]);
        $resort->save();
    }
}
