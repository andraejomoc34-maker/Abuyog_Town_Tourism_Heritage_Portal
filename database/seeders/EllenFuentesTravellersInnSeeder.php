<?php

namespace Database\Seeders;

use App\Models\Resort;
use Illuminate\Database\Seeder;

class EllenFuentesTravellersInnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resort = Resort::query()->firstOrNew([
            'property_code' => 'ellen-fuentes-travellers-inn',
        ]);

        if (! $resort->exists) {
            $resort = Resort::query()->firstOrNew([
                'name' => "ELLEN FUENTES TRAVELLER'S INN",
            ]);
        }

        $resort->fill([
            'name' => "ELLEN FUENTES TRAVELLER'S INN",
            'description' => null,
            'location' => 'Maharlika Highway, Guintagbucan, Abuyog, Leyte',
            'image' => '/Fuentes.jpg',
            'image_url' => '/Fuentes.jpg',
            'contact_information' => implode("\n", [
                'Contact: 09526234424',
                "Facebook: Ellen Fuentes Traveller's Inn",
                'Google Address: Q243+5Wh, Abuyog, Leyte, Philippines',
            ]),
            'amenities' => null,
            'price_information' => implode("\n", [
                'AIR-CONDITIONED ROOMS',
                'with cable television',
                'Good for 2 pax',
                '24 hours — ₱1,200',
                '12 hours — ₱900',
                '6 hours — ₱700',
                '',
                'ORDINARY ROOMS',
                'with cable television',
                'Good for 2 pax',
                '24 hours — ₱900',
                '12 hours — ₱700',
                '6 hours — ₱500',
                '',
                'SPECIAL ROOM AVAILABLE',
                'Room No. 189',
                '24 hours only',
                'Room 1 — ₱1,400',
                'Room 2 — ₱1,400',
                '',
                'ADDITIONAL FEES',
                'Extension: ₱150 per hour',
                'Extra Bed: ₱250',
                'Senior Citizen Discount: 20%',
                'Please provide ID for verification.',
            ]),
            'status' => 'active',
            'property_type' => 'inn',
            'property_code' => 'ellen-fuentes-travellers-inn',
        ]);
        $resort->save();
    }
}
