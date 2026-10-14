<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_face_identities', function (Blueprint $table): void {
            $table->binary('reference_image')->nullable()->after('external_image_id_hash');
        });
    }

    public function down(): void
    {
        Schema::table('user_face_identities', function (Blueprint $table): void {
            $table->dropColumn('reference_image');
        });
    }
};
