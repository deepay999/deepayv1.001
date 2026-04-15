<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'ts')) {
                $table->tinyInteger('ts')->default(0)->after('status')->comment('2FA enabled: 1=yes 0=no');
            }
            if (!Schema::hasColumn('admins', 'tsc')) {
                $table->string('tsc')->nullable()->after('ts')->comment('2FA secret (TOTP)');
            }
        });
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['ts', 'tsc']);
        });
    }
};
