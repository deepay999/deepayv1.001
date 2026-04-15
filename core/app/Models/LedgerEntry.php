<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * LedgerEntry — immutable double-entry bookkeeping record.
 *
 * ❗ NEVER call update() or delete() on this model.
 *    MySQL triggers also block UPDATE/DELETE at DB level.
 *    Only WalletService::post() should create entries.
 */
class LedgerEntry extends Model
{
    public    $timestamps = false;
    protected $table      = 'ledger_entries';

    protected $fillable = [
        'user_id','type','amount','currency',
        'balance_after','reference_id','description',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'balance_after'=> 'decimal:2',
        'created_at'   => 'datetime',
    ];

    // ── Guard against accidental mutation ─────────────────────
    public function save(array $options = []): bool
    {
        if (!$this->exists) {
            return parent::save($options);
        }
        throw new \LogicException('LedgerEntry is immutable — save() after creation is forbidden.');
    }

    public function delete(): bool|null
    {
        throw new \LogicException('LedgerEntry is immutable — delete() is forbidden.');
    }

    // ── Relationships ──────────────────────────────────────────
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
