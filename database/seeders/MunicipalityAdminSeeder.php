<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class MunicipalityAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        User::query()->firstOrCreate(
            ['email' => 'municipality.admin@abuyogtourism.test'],
            [
                'name' => 'Abuyog Municipality Tourism Admin',
                'password' => 'Municipality@12345',
                'role' => 'municipality_admin',
                'resort_id' => null,
                'is_active' => true,
            ],
        );
    }
}
