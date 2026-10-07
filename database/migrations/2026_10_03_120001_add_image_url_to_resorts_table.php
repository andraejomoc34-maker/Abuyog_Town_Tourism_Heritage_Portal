<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resorts', function (Blueprint $table): void {
            if (! Schema::hasColumn('resorts', 'image_url')) {
                $table->string('image_url')->nullable()->after('location');
            }
        });
    }

    public function down(): void
    {
        Schema::table('resorts', function (Blueprint $table): void {
            if (Schema::hasColumn('resorts', 'image_url')) {
                $table->dropColumn('image_url');
            }
        });
    }
};
