<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            // personal or business
            $table->string('user_type', 20)->default('personal')->after('username');
            // wallet frozen flag (account-level, e.g. after risk trigger)
            $table->boolean('wallet_frozen')->default(false)->after('user_type');
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['user_type', 'wallet_frozen']);
        });
    }
};
