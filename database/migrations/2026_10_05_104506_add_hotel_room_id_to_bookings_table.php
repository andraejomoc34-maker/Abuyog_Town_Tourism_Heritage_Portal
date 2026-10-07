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
        Schema::table('bookings', function (Blueprint $table): void {
            $table->foreignId('hotel_room_id')->nullable()->after('cottage_id')->constrained('hotel_rooms')->nullOnDelete();
            $table->index(['hotel_room_id', 'booking_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropIndex(['hotel_room_id', 'booking_date', 'status']);
            $table->dropConstrainedForeignId('hotel_room_id');
        });
    }
};
