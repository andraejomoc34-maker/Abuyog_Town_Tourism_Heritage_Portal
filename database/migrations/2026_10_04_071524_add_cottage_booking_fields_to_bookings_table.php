<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('cottage_id')->nullable();
            $table->unsignedSmallInteger('cottage_quantity')->default(1);
            $table->index(['cottage_id', 'booking_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['cottage_id', 'booking_date', 'status']);
            $table->dropColumn('cottage_id');
            $table->dropColumn('cottage_quantity');
        });
    }
};
