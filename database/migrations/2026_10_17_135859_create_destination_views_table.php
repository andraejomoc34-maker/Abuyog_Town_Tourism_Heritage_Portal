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
        Schema::create('destination_views', function (Blueprint $table): void {
            $table->id();
            $table->string('destination_type', 20);
            $table->unsignedBigInteger('destination_id');
            $table->char('visitor_key', 64);
            $table->date('viewed_on');
            $table->timestamp('viewed_at');
            $table->unique(
                ['destination_type', 'destination_id', 'visitor_key', 'viewed_on'],
                'destination_views_daily_visitor_unique',
            );
            $table->index(['destination_type', 'destination_id', 'viewed_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destination_views');
    }
};
