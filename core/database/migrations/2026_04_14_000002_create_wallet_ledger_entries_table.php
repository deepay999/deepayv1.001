<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallet_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->string('trx', 64)->index()->comment('Shared transaction reference (paired debit/credit share same trx)');
            $table->string('entry_type', 10)->comment('debit|credit');
            $table->unsignedBigInteger('user_id')->index();
            $table->decimal('amount', 28, 8);
            $table->string('currency', 10)->default('EUR');
            $table->decimal('running_balance', 28, 8)->default(0)->comment('Balance after this entry');
            $table->string('description')->nullable();
            $table->string('remark', 64)->nullable()->comment('send_money|payout|swan_deposit|reward_redemption|internal_transfer|fee etc.');
            $table->unsignedBigInteger('related_user_id')->nullable()->comment('Counterparty user for internal transfers');
            $table->unsignedBigInteger('airwallex_payout_id')->nullable();
            $table->unsignedBigInteger('swan_account_id')->nullable();
            $table->json('meta')->nullable()->comment('Arbitrary audit metadata');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_ledger_entries');
    }
};
