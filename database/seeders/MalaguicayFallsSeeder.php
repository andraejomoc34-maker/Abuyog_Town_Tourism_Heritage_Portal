<?php

namespace Database\Seeders;

use App\Models\Resort;
use Illuminate\Database\Seeder;

class MalaguicayFallsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Resort::updateOrCreate([
            'name' => 'Malaguicay Falls',
        ], [
            'description' => 'A beautiful natural waterfall destination surrounded by lush greenery and peaceful natural surroundings.',
            'location' => 'Abuyog, Leyte',
            'image' => '/abuyog-10.jpg',
            'image_url' => '/abuyog-10.jpg',
            'status' => 'active',
            'property_type' => 'nature',
        ]);
    }
}
