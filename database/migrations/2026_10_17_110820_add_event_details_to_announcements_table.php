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
        Schema::table('announcements', function (Blueprint $table): void {
            $table->date('event_start_date')->nullable();
            $table->date('event_end_date')->nullable();
            $table->time('event_start_time')->nullable();
            $table->string('event_venue')->nullable();
            $table->string('event_organizer')->nullable();
            $table->text('event_contact_information')->nullable();
            $table->text('event_source_url')->nullable();
            $table->string('event_date_status')->default('Unverified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table): void {
            $table->dropColumn([
                'event_start_date',
                'event_end_date',
                'event_start_time',
                'event_venue',
                'event_organizer',
                'event_contact_information',
                'event_source_url',
                'event_date_status',
            ]);
        });
    }
};
