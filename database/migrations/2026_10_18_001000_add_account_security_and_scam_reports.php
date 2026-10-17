<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->text('disabled_reason')->nullable();
            $table->foreignId('disabled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('disabled_at')->nullable();
        });

        Schema::create('scam_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reporter_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reported_account', 255);
            $table->string('reason', 40);
            $table->text('description');
            $table->string('activity_reference', 120)->nullable();
            $table->string('status', 24)->default('pending');
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::create('account_security_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('scam_report_id')->nullable()->constrained('scam_reports')->nullOnDelete();
            $table->string('action', 40);
            $table->text('reason')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();

            $table->index(['target_user_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_security_events');
        Schema::dropIfExists('scam_reports');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('disabled_by');
            $table->dropColumn(['disabled_reason', 'disabled_at']);
        });
    }
};
