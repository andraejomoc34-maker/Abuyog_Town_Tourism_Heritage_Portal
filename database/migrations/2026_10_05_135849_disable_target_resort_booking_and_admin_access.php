<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ([
            'Castañas Spring Resort' => 'castanas-spring-resort',
            'VALIDA MAKABLACK RESORT' => 'valida-makablack-resort',
        ] as $name => $propertyCode) {
            DB::table('resorts')
                ->where('name', $name)
                ->whereNull('property_code')
                ->update(['property_code' => $propertyCode]);
        }

        DB::table('users')
            ->whereIn('email', [
                'castanas.admin@abuyogtourism.test',
                'valida.admin@abuyogtourism.test',
            ])
            ->where('role', 'resort_admin')
            ->update(['is_active' => false]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')
            ->whereIn('email', [
                'castanas.admin@abuyogtourism.test',
                'valida.admin@abuyogtourism.test',
            ])
            ->where('role', 'resort_admin')
            ->update(['is_active' => true]);

        DB::table('resorts')
            ->whereIn('property_code', [
                'castanas-spring-resort',
                'valida-makablack-resort',
            ])
            ->whereIn('name', [
                'Castañas Spring Resort',
                'VALIDA MAKABLACK RESORT',
            ])
            ->update(['property_code' => null]);
    }
};
