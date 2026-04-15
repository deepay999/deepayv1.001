<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * OvoPay users table — exact spec.
 *
 * If a `users` table already exists (legacy system) this migration
 * adds only the missing columns so it is safe to run on any database.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('email')->unique();
                $table->string('password');
                $table->enum('role', ['user', 'merchant', 'admin'])->default('user');
                $table->enum('kyc_status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->timestamps();
            });
        } else {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'role')) {
                    $table->enum('role', ['user', 'merchant', 'admin'])
                          ->default('user')
                          ->after('password');
                }
                if (!Schema::hasColumn('users', 'kyc_status')) {
                    $table->enum('kyc_status', ['pending', 'approved', 'rejected'])
                          ->default('pending')
                          ->after('role');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'kyc_status')) {
            Schema::table('users', fn (Blueprint $t) => $t->dropColumn('kyc_status'));
        }
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', fn (Blueprint $t) => $t->dropColumn('role'));
        }
    }
};
