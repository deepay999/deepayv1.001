<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ledger_transaction_id')->constrained('ledger_transactions')->cascadeOnDelete();
            $table->foreignId('ledger_account_id')->constrained('ledger_accounts')->cascadeOnDelete();
            $table->string('entry_side');
            $table->decimal('amount', 24, 8);
            $table->string('currency', 16);
            $table->string('reference_code')->nullable();
            $table->string('external_reference')->nullable();
            $table->string('idempotency_key')->nullable()->index();
            $table->string('event_type');
            $table->timestamp('posted_at');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['ledger_account_id', 'currency']);
            $table->index(['event_type', 'posted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};