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
        Schema::create('content_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('content_type');
            $table->unsignedBigInteger('content_id')->nullable();
            $table->string('action', 32);
            $table->string('description', 500);
            $table->json('before_values')->nullable();
            $table->json('after_values')->nullable();
            $table->timestamps();

            $table->index(['content_type', 'content_id']);
            $table->index(['action', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_changes');
    }
};
