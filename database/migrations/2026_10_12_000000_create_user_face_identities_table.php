<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_face_identities', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('face_id');
            $table->char('face_id_hash', 64)->unique();
            $table->text('external_image_id');
            $table->char('external_image_id_hash', 64)->unique();
            $table->timestamp('consented_at');
            $table->timestamps();
        });

        Schema::create('face_identity_registration_locks', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
        });

        DB::table('face_identity_registration_locks')->insert(['id' => 1]);
    }

    public function down(): void
    {
        Schema::dropIfExists('face_identity_registration_locks');
        Schema::dropIfExists('user_face_identities');
    }
};
