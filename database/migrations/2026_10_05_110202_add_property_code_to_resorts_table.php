<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('resorts', function (Blueprint $table): void {
            $table->string('property_code')->nullable()->unique()->after('property_type');
        });

        $hotelId = DB::table('resorts')
            ->where('name', 'Abuyog Hotel')
            ->orderBy('id')
            ->value('id');

        if ($hotelId !== null) {
            DB::table('resorts')
                ->where('id', $hotelId)
                ->update(['property_code' => 'abuyog-hotel']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resorts', function (Blueprint $table): void {
            $table->dropUnique(['property_code']);
            $table->dropColumn('property_code');
        });
    }
};
