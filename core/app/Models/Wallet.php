<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Wallet — one per (user × currency).
 *
 * available_balance is a CACHED value only.
 * The ledger is the single source of truth.
 * Never update available_balance directly — use WalletService::post().
 */
class Wallet extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id','currency','available_balance','frozen_balance'];

    protected $casts = [
        'available_balance' => 'decimal:2',
        'frozen_balance'    => 'decimal:2',
    ];

    // ── Relationships ──────────────────────────────────────────
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class, 'user_id', 'user_id')
                    ->where('currency', $this->currency);
    }

    // ── Computed balance from ledger (authoritative) ───────────
    public function computedBalance(): string
    {
        $credit = $this->ledgerEntries()->where('type','credit')->sum('amount');
        $debit  = $this->ledgerEntries()->where('type','debit')->sum('amount');
        return bcsub((string)$credit, (string)$debit, 2);
    }

    // ── Scopes ─────────────────────────────────────────────────
    public function scopeForUser($q, int $userId, string $currency = 'EUR')
    {
        return $q->where('user_id', $userId)->where('currency', $currency);
    }
}
