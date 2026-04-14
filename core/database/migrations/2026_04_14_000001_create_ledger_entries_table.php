<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('currency', 3); // EUR, USD, GBP
            // Positive = credit, negative = debit (stored as signed decimal)
            $table->decimal('amount', 20, 8);
            $table->string('type', 50);   // credit, debit
            $table->string('reference_type', 100)->nullable(); // send_money, deposit, withdrawal, etc.
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('description')->nullable();
            $table->string('idempotency_key', 128)->unique()->nullable();
            $table->decimal('running_balance', 20, 8)->default(0); // snapshot after entry
            $table->timestamps();

            $table->index(['user_id', 'currency']);
            $table->index(['reference_type', 'reference_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('ledger_entries');
    }
};
