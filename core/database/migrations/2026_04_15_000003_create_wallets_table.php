<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 2. wallets — one row per (user × currency).
 *
 *    ⚠️  IMPORTANT: available_balance and frozen_balance here are
 *    CACHED/DENORMALISED values only — they must ALWAYS equal the
 *    sum of the corresponding ledger entries.  The ledger is the
 *    single source of truth.  These columns exist only to avoid
 *    a full ledger SUM on every page load.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->char('currency', 3)
                  ->comment('ISO-4217 currency code: EUR, USD, GBP …');

            // Cached balance — always = SUM(ledger WHERE user_id AND currency AND type=credit)
            //                          - SUM(… type=debit)
            // Updated atomically inside WalletService::post() — never touched directly.
            $table->decimal('available_balance', 18, 8)->default(0)
                  ->comment('Cached sum of cleared ledger entries');
            $table->decimal('frozen_balance', 18, 8)->default(0)
                  ->comment('Funds reserved for pending operations');

            $table->timestamps();

            // One wallet per currency per user
            $table->unique(['user_id', 'currency'], 'wallets_user_currency_unique');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->index(['user_id', 'currency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
