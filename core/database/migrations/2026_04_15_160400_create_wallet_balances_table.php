<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallet_balances', function (Blueprint $table) {
            $table->id();
            $table->string('account_type');
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->string('account_code')->nullable();
            $table->string('currency', 16);
            $table->decimal('available_balance', 24, 8)->default(0);
            $table->decimal('pending_balance', 24, 8)->default(0);
            $table->decimal('reserved_balance', 24, 8)->default(0);
            $table->unsignedBigInteger('last_ledger_entry_id')->nullable();
            $table->timestamps();

            $table->unique(['account_type', 'owner_id', 'currency'], 'wallet_balances_owner_unique');
            $table->unique(['account_code', 'currency'], 'wallet_balances_code_currency_unique');
            $table->index(['account_type', 'currency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_balances');
    }
};