<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * OvoPay core financial schema — 7 tables (users handled in 000005).
 *
 *   wallets, ledger_entries, transfers, iban_accounts,
 *   payments, withdrawals, points, points_log
 *
 * + MySQL triggers that make ledger_entries immutable at DB level.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── wallets ─────────────────────────────────────────────
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('currency');
            $table->decimal('available_balance', 18, 2)->default(0);
            $table->decimal('frozen_balance', 18, 2)->default(0);
            $table->timestamps();
        });

        // ── ledger_entries 🔥 ───────────────────────────────────
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['credit', 'debit']);
            $table->decimal('amount', 18, 2);
            $table->string('currency', 10);
            $table->decimal('balance_after', 18, 2)
                  ->comment('Wallet available_balance immediately after this entry');
            $table->string('reference_id', 100)->nullable()
                  ->comment('e.g. transfer:42  payment:7  withdrawal:3');
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            // NO updated_at — immutable rows have no update timestamp

            $table->index('user_id');
            $table->index('reference_id');
            $table->index(['user_id', 'currency', 'created_at']);
        });

        // MySQL triggers — block UPDATE and DELETE at engine level
        DB::unprepared('
            CREATE TRIGGER ledger_no_update
            BEFORE UPDATE ON ledger_entries FOR EACH ROW
            BEGIN
                SIGNAL SQLSTATE "45000"
                SET MESSAGE_TEXT = "ledger_entries is immutable: UPDATE forbidden";
            END
        ');
        DB::unprepared('
            CREATE TRIGGER ledger_no_delete
            BEFORE DELETE ON ledger_entries FOR EACH ROW
            BEGIN
                SIGNAL SQLSTATE "45000"
                SET MESSAGE_TEXT = "ledger_entries is immutable: DELETE forbidden";
            END
        ');

        // ── transfers ───────────────────────────────────────────
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('from_user_id');
            $table->unsignedBigInteger('to_user_id');
            $table->decimal('amount', 18, 2);
            $table->string('currency', 10)->default('EUR');
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->timestamps();

            $table->index('from_user_id');
            $table->index('to_user_id');
            $table->index(['from_user_id', 'status']);
        });

        // ── iban_accounts (Swan) ────────────────────────────────
        Schema::create('iban_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('iban', 64)->unique();
            $table->string('bic', 64)->nullable();
            $table->string('provider', 50)->default('swan');
            $table->string('swan_account_id', 100)->nullable();
            $table->enum('status', ['active', 'suspended', 'closed'])->default('active');
            $table->timestamps();

            $table->index('user_id');
        });

        // ── payments (Airwallex incoming) ───────────────────────
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->string('currency', 10);
            $table->string('status', 50)->default('pending');
            $table->string('provider_payment_id', 100)->unique()->nullable();
            $table->json('provider_raw')->nullable()
                  ->comment('Full Airwallex webhook payload');
            $table->timestamps();

            $table->index('user_id');
            $table->index('provider_payment_id');
            $table->index(['user_id', 'status', 'created_at']);
        });

        // ── withdrawals (Swan / Airwallex out) ──────────────────
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->string('currency', 10)->default('EUR');
            $table->string('method', 50)->comment('swan | airwallex | sepa | swift');
            $table->string('status', 50)->default('pending');
            $table->string('provider_reference', 100)->nullable();
            $table->json('meta')->nullable()
                  ->comment('Destination IBAN, BIC, beneficiary name');
            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'status', 'created_at']);
        });

        // ── points (non-financial rewards) ──────────────────────
        Schema::create('points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('balance')->default(0);
            // No timestamps — balance is derived from points_log
        });

        // ── points_log ──────────────────────────────────────────
        Schema::create('points_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['earn', 'spend']);
            $table->unsignedInteger('amount');
            $table->string('reason', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index(['user_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS ledger_no_update');
        DB::unprepared('DROP TRIGGER IF EXISTS ledger_no_delete');

        foreach ([
            'points_log', 'points', 'withdrawals', 'payments',
            'iban_accounts', 'transfers', 'ledger_entries', 'wallets',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
