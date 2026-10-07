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
        Schema::create('hotel_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resort_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('room_type');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('capacity')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->unsignedSmallInteger('available_quantity')->default(0);
            $table->string('status')->default('Unavailable');
            $table->string('image')->nullable();
            $table->timestamps();
            $table->index(['resort_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_rooms');
    }
};
