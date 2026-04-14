<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('airwallex_payouts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('trx', 64)->unique()->index();
            $table->string('airwallex_transfer_id')->nullable()->unique()->comment('ID returned by Airwallex');
            $table->decimal('amount', 28, 8);
            $table->string('currency', 10)->default('EUR');
            $table->string('beneficiary_name')->nullable();
            $table->string('beneficiary_account_number')->nullable();
            $table->string('beneficiary_routing_number')->nullable();
            $table->string('beneficiary_bank_name')->nullable();
            $table->string('beneficiary_country', 5)->nullable();
            $table->string('payout_method', 30)->default('SWIFT')->comment('SWIFT|SEPA|LOCAL');
            $table->string('reference')->nullable()->comment('Payment reference shown on recipient statement');
            $table->tinyInteger('status')->default(0)->comment('0=pending,1=processing,2=completed,3=failed,9=cancelled');
            $table->string('failure_reason')->nullable();
            $table->json('airwallex_payload')->nullable()->comment('Raw Airwallex API response');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('airwallex_payouts');
    }
};
