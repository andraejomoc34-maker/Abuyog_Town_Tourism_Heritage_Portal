<?php

namespace Database\Seeders;

use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\TouristSpot;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(MalaguicayFallsSeeder::class);
        $this->call(AbuyogHotelSeeder::class);
        $this->call(VillageCondotelSeeder::class);
        $this->call(HabitatBudgetInnSeeder::class);
        $this->call(FlorinaCountryLodgeSeeder::class);
        $this->call(EllenFuentesTravellersInnSeeder::class);

        $castanas = Resort::firstOrCreate([
            'name' => 'Castañas Spring Resort',
        ], [
            'description' => 'A relaxing resort destination for travelers seeking a calm getaway in Abuyog.',
            'location' => 'Abuyog, Leyte',
            'image' => '/abuyog-2.jpg',
            'image_url' => '/abuyog-2.jpg',
            'status' => 'active',
            'property_type' => 'resort',
            'property_code' => 'castanas-spring-resort',
        ]);
        if (blank($castanas->property_code)) {
            $castanas->update(['property_code' => 'castanas-spring-resort']);
        }
        $castanas->update([
            'image' => '/abuyog-2.jpg',
            'image_url' => '/abuyog-2.jpg',
        ]);

        $valida = Resort::firstOrCreate([
            'name' => 'VALIDA MAKABLACK RESORT',
        ], [
            'description' => 'A mountain resort destination that complements the heritage and nature offerings of the town.',
            'location' => 'Abuyog, Leyte',
            'image' => '/abuyog-4.jpg',
            'image_url' => '/abuyog-4.jpg',
            'status' => 'active',
            'property_type' => 'resort',
            'property_code' => 'valida-makablack-resort',
        ]);
        if (blank($valida->property_code)) {
            $valida->update(['property_code' => 'valida-makablack-resort']);
        }

        $customer = User::factory()->create([
            'name' => 'Normal Customer',
            'email' => 'customer@abuyogtourism.test',
            'role' => 'user',
            'resort_id' => null,
        ]);

        $superAdmin = User::factory()->create([
            'name' => 'Abuyog Tourism Super Admin',
            'email' => 'admin@abuyogtourism.test',
            'password' => bcrypt('Admin@12345'),
            'role' => 'super_admin',
            'resort_id' => null,
        ]);

        Inquiry::create([
            'user_id' => $customer->id,
            'resort_id' => $castanas->id,
            'message' => 'I would like to ask about availability for the upcoming weekend.',
            'status' => 'Pending',
        ]);

        Inquiry::create([
            'user_id' => $customer->id,
            'resort_id' => $valida->id,
            'message' => 'May I ask for details about room availability and local tour options?',
            'status' => 'Answered',
        ]);

        TouristSpot::firstOrCreate([
            'name' => 'Abuyog Coastal View',
            'category' => 'Nature',
        ], [
            'description' => 'A scenic natural attraction ideal for outdoor exploration and photography.',
            'location' => 'Abuyog, Leyte',
            'image_url' => '/abuyog-2.jpg',
            'status' => 'active',
        ]);

        $this->call(MunicipalityAdminSeeder::class);
    }
}
