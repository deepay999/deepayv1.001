<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('general_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('general_settings', 'loyalty_points')) {
                $table->tinyInteger('loyalty_points')->default(0);
            }
            if (!Schema::hasColumn('general_settings', 'points_per_currency')) {
                $table->decimal('points_per_currency', 28, 8)->default(1);
            }
            if (!Schema::hasColumn('general_settings', 'points_value')) {
                $table->decimal('points_value', 28, 8)->default(0.01);
            }
            if (!Schema::hasColumn('general_settings', 'min_redeem_points')) {
                $table->unsignedInteger('min_redeem_points')->default(100);
            }
        });
    }

    public function down(): void
    {
        Schema::table('general_settings', function (Blueprint $table) {
            $table->dropColumn(['loyalty_points', 'points_per_currency', 'points_value', 'min_redeem_points']);
        });
    }
};
