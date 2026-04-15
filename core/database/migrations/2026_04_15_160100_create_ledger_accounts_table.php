<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_type');
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->string('account_code')->nullable();
            $table->string('currency', 16);
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['account_type', 'owner_id', 'currency'], 'ledger_accounts_owner_unique');
            $table->unique(['account_code', 'currency'], 'ledger_accounts_code_currency_unique');
            $table->index(['account_type', 'currency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_accounts');
    }
};