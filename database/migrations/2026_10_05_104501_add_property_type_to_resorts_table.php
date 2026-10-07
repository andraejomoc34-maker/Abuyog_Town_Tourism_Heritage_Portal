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
            $table->string('property_type')->default('resort')->index();
        });

        DB::table('resorts')
            ->where('name', 'Malaguicay Falls')
            ->update(['property_type' => 'nature']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resorts', function (Blueprint $table): void {
            $table->dropIndex(['property_type']);
            $table->dropColumn('property_type');
        });
    }
};
