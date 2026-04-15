<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Performance optimization migration.
 *
 * Adds composite indexes to all high-traffic tables so that
 * user-scoped queries, status filters, date ranges, and TRX
 * lookups hit indexes instead of doing full table scans.
 *
 * Safe to run multiple times — every addIndex call is wrapped
 * in a has-index guard so it won't fail on re-runs.
 */
return new class extends Migration
{
    // ── helpers ────────────────────────────────────────────────
    private function addIndex(Blueprint $t, string $table, array $cols, ?string $name = null): void
    {
        $indexName = $name ?? ($table . '_' . implode('_', $cols) . '_idx');
        $existing  = collect(DB::select("SHOW INDEX FROM `{$table}`"))->pluck('Key_name');
        if (!$existing->contains($indexName)) {
            $t->index($cols, $indexName);
        }
    }

    // ── up ─────────────────────────────────────────────────────
    public function up(): void
    {
        /* ── transactions ──────────────────────────────────── */
        if (Schema::hasTable('transactions')) {
            Schema::table('transactions', function (Blueprint $t) {
                $this->addIndex($t, 'transactions', ['user_id', 'created_at']);
                $this->addIndex($t, 'transactions', ['agent_id', 'created_at']);
                $this->addIndex($t, 'transactions', ['merchant_id', 'created_at']);
                $this->addIndex($t, 'transactions', ['trx']);
                $this->addIndex($t, 'transactions', ['remark', 'created_at']);
                $this->addIndex($t, 'transactions', ['user_id', 'remark', 'created_at']);
            });
        }

        /* ── deposits ──────────────────────────────────────── */
        if (Schema::hasTable('deposits')) {
            Schema::table('deposits', function (Blueprint $t) {
                $this->addIndex($t, 'deposits', ['user_id', 'status', 'created_at']);
                $this->addIndex($t, 'deposits', ['agent_id', 'status', 'created_at']);
                $this->addIndex($t, 'deposits', ['merchant_id', 'status', 'created_at']);
                $this->addIndex($t, 'deposits', ['trx']);
                $this->addIndex($t, 'deposits', ['status', 'created_at']);
            });
        }

        /* ── withdrawals ───────────────────────────────────── */
        if (Schema::hasTable('withdrawals')) {
            Schema::table('withdrawals', function (Blueprint $t) {
                $this->addIndex($t, 'withdrawals', ['user_id', 'status', 'created_at']);
                $this->addIndex($t, 'withdrawals', ['agent_id', 'status', 'created_at']);
                $this->addIndex($t, 'withdrawals', ['trx']);
                $this->addIndex($t, 'withdrawals', ['status', 'created_at']);
            });
        }

        /* ── send_moneys ───────────────────────────────────── */
        if (Schema::hasTable('send_moneys')) {
            Schema::table('send_moneys', function (Blueprint $t) {
                $this->addIndex($t, 'send_moneys', ['sender_id', 'created_at']);
                $this->addIndex($t, 'send_moneys', ['receiver_id', 'created_at']);
                $this->addIndex($t, 'send_moneys', ['trx']);
            });
        }

        /* ── bank_transfers ────────────────────────────────── */
        if (Schema::hasTable('bank_transfers')) {
            Schema::table('bank_transfers', function (Blueprint $t) {
                $this->addIndex($t, 'bank_transfers', ['user_id', 'status', 'created_at']);
                $this->addIndex($t, 'bank_transfers', ['trx']);
            });
        }

        /* ── users ─────────────────────────────────────────── */
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $t) {
                $this->addIndex($t, 'users', ['status', 'kv', 'ev']);
                $this->addIndex($t, 'users', ['created_at']);
                $this->addIndex($t, 'users', ['ref_by']);
            });
        }

        /* ── virtual_cards ─────────────────────────────────── */
        if (Schema::hasTable('virtual_cards')) {
            Schema::table('virtual_cards', function (Blueprint $t) {
                $this->addIndex($t, 'virtual_cards', ['user_id', 'status']);
            });
        }

        /* ── virtual_card_holders ──────────────────────────── */
        if (Schema::hasTable('virtual_card_holders')) {
            Schema::table('virtual_card_holders', function (Blueprint $t) {
                $this->addIndex($t, 'virtual_card_holders', ['user_id']);
            });
        }

        /* ── investments ───────────────────────────────────── */
        if (Schema::hasTable('investments')) {
            Schema::table('investments', function (Blueprint $t) {
                $this->addIndex($t, 'investments', ['user_id', 'status', 'created_at']);
                $this->addIndex($t, 'investments', ['next_interest_date']);
            });
        }

        /* ── support_tickets ───────────────────────────────── */
        if (Schema::hasTable('support_tickets')) {
            Schema::table('support_tickets', function (Blueprint $t) {
                $this->addIndex($t, 'support_tickets', ['user_id', 'status']);
                $this->addIndex($t, 'support_tickets', ['created_at']);
            });
        }

        /* ── Apply MySQL performance variables (session level) */
        /* These are advisory — they tune the current connection */
        DB::statement("SET SESSION sort_buffer_size       = 4 * 1024 * 1024");
        DB::statement("SET SESSION join_buffer_size       = 4 * 1024 * 1024");
        DB::statement("SET SESSION read_rnd_buffer_size   = 2 * 1024 * 1024");
    }

    // ── down ───────────────────────────────────────────────────
    public function down(): void
    {
        $drops = [
            'transactions'       => ['transactions_user_id_created_at_idx','transactions_agent_id_created_at_idx','transactions_merchant_id_created_at_idx','transactions_trx_idx','transactions_remark_created_at_idx','transactions_user_id_remark_created_at_idx'],
            'deposits'           => ['deposits_user_id_status_created_at_idx','deposits_agent_id_status_created_at_idx','deposits_merchant_id_status_created_at_idx','deposits_trx_idx','deposits_status_created_at_idx'],
            'withdrawals'        => ['withdrawals_user_id_status_created_at_idx','withdrawals_agent_id_status_created_at_idx','withdrawals_trx_idx','withdrawals_status_created_at_idx'],
            'send_moneys'        => ['send_moneys_sender_id_created_at_idx','send_moneys_receiver_id_created_at_idx','send_moneys_trx_idx'],
            'bank_transfers'     => ['bank_transfers_user_id_status_created_at_idx','bank_transfers_trx_idx'],
            'users'              => ['users_status_kv_ev_idx','users_created_at_idx','users_ref_by_idx'],
            'virtual_cards'      => ['virtual_cards_user_id_status_idx'],
            'virtual_card_holders' => ['virtual_card_holders_user_id_idx'],
            'investments'        => ['investments_user_id_status_created_at_idx','investments_next_interest_date_idx'],
            'support_tickets'    => ['support_tickets_user_id_status_idx','support_tickets_created_at_idx'],
        ];

        foreach ($drops as $table => $indexes) {
            if (!Schema::hasTable($table)) continue;
            Schema::table($table, function (Blueprint $t) use ($table, $indexes) {
                foreach ($indexes as $idx) {
                    $existing = collect(DB::select("SHOW INDEX FROM `{$table}`"))->pluck('Key_name');
                    if ($existing->contains($idx)) {
                        $t->dropIndex($idx);
                    }
                }
            });
        }
    }
};
