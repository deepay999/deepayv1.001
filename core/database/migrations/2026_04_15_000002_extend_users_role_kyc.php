<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 1. Extend the existing users table with role + KYC fields.
 *    We guard every addColumn call so this migration is safe
 *    to run on both fresh installs and existing databases.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['user', 'merchant', 'admin'])
                      ->default('user')
                      ->after('id')
                      ->comment('Primary role of the user');
            }
            if (!Schema::hasColumn('users', 'kyc_status')) {
                $table->enum('kyc_status', ['none', 'pending', 'approved', 'rejected'])
                      ->default('none')
                      ->after('role')
                      ->comment('KYC verification state');
            }
            if (!Schema::hasColumn('users', 'kyc_submitted_at')) {
                $table->timestamp('kyc_submitted_at')->nullable()->after('kyc_status');
            }
            if (!Schema::hasColumn('users', 'kyc_reviewed_at')) {
                $table->timestamp('kyc_reviewed_at')->nullable()->after('kyc_submitted_at');
            }
            if (!Schema::hasColumn('users', 'kyc_reject_reason')) {
                $table->string('kyc_reject_reason')->nullable()->after('kyc_reviewed_at');
            }
        });

        // Fast lookups on role + kyc_status
        $indexes = \DB::select("SHOW INDEX FROM `users`");
        $names   = collect($indexes)->pluck('Key_name');
        if (!$names->contains('users_role_kyc_status_idx')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index(['role', 'kyc_status'], 'users_role_kyc_status_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(array_filter(
                ['role', 'kyc_status', 'kyc_submitted_at', 'kyc_reviewed_at', 'kyc_reject_reason'],
                fn($col) => Schema::hasColumn('users', $col)
            ));
        });
    }
};
