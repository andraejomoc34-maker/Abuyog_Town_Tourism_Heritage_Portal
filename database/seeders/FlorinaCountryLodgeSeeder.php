<?php

namespace Database\Seeders;

use App\Models\Resort;
use Illuminate\Database\Seeder;

class FlorinaCountryLodgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resort = Resort::query()->firstOrNew([
            'property_code' => 'florina-country-lodge',
        ]);

        if (! $resort->exists) {
            $resort = Resort::query()->firstOrNew([
                'name' => 'Florina Country Lodge',
            ]);
        }

        $resort->fill([
            'name' => 'Florina Country Lodge',
            'description' => 'Florina Country Lodge is an accommodation option located along National Highway in Guintagbucan, Abuyog, Leyte.',
            'location' => 'National Highway, Guintagbucan, Abuyog, Leyte',
            'image' => '/Florida.jpg',
            'image_url' => '/Florida.jpg',
            'contact_information' => '0927-696-6646',
            'amenities' => null,
            'price_information' => implode("\n", [
                'Rates shown from the provided accommodation information.',
                '',
                'FAMILY ROOM',
                'Good for 2 persons',
                'Features: Air-conditioned, Hot & cold shower, Cable TV',
                '2:00 PM check-in — ₱1,800',
                '12:00 noon check-out with free breakfast — ₱2,000',
                '',
                'DE LUXE ROOMS',
                'Good for 2 persons',
                'Features: Air-conditioned, Hot & cold shower, Cable TV',
                '2:00 PM check-in — ₱1,500',
                '12:00 noon check-out with free breakfast — ₱1,700',
                '',
                'BASIC ROOM',
                'Good for 2 persons',
                'Features: Air-conditioned room, Cable TV',
                '2:00 PM check-in — ₱1,100',
                '12:00 noon check-out with free breakfast — ₱1,300',
                '',
                'BUDGET ROOMS',
                'Good for 2 persons',
                'Features: Electric fan',
                '12 hours — ₱350',
                '24 hours — ₱450',
                '',
                'ADDITIONAL FEES',
                'Extra Person — ₱100 per head',
                'Extra Bed/Person — ₱100 / ₱200',
                'Early Check-In — ₱100/hour',
                'Late Check-Out — ₱100/hour',
            ]),
            'status' => 'active',
            'property_type' => 'lodge',
            'property_code' => 'florina-country-lodge',
        ]);
        $resort->save();
    }
}
