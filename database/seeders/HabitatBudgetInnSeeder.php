<?php

namespace Database\Seeders;

use App\Models\Resort;
use Illuminate\Database\Seeder;

class HabitatBudgetInnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resort = Resort::query()->firstOrNew([
            'property_code' => 'habitat-budget-inn',
        ]);

        if (! $resort->exists) {
            $resort = Resort::query()->firstOrNew([
                'name' => 'HABITAT BUDGET INN',
            ]);
        }

        $resort->fill([
            'name' => 'HABITAT BUDGET INN',
            'description' => 'HABITAT BUDGET INN is a budget accommodation option in Abuyog, Leyte offering lodging and boarding options.',
            'location' => 'Abuyog, Leyte',
            'image' => '/Habitat.jpg',
            'image_url' => '/Habitat.jpg',
            'contact_information' => '09984398427',
            'amenities' => null,
            'price_information' => implode("\n", [
                'Rates were provided for this project and have not been independently verified as current official rates.',
                '',
                'LODGING',
                '₱300 / day',
                '',
                'BOARDING',
                '₱2,500 / person',
            ]),
            'status' => 'active',
            'property_type' => 'budget_accommodation',
            'property_code' => 'habitat-budget-inn',
        ]);
        $resort->save();
    }
}
