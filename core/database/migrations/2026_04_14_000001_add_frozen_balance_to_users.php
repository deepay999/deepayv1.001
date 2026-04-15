<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'frozen_balance')) {
                $table->decimal('frozen_balance', 28, 8)->default(0)->after('balance');
            }
            if (!Schema::hasColumn('users', 'points')) {
                $table->unsignedBigInteger('points')->default(0)->after('frozen_balance');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['frozen_balance', 'points']);
        });
    }
};
