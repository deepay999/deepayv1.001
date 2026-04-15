<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    protected $fillable = [
        'ledger_transaction_id',
        'ledger_account_id',
        'entry_side',
        'amount',
        'currency',
        'reference_code',
        'external_reference',
        'idempotency_key',
        'event_type',
        'posted_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'posted_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function account()
    {
        return $this->belongsTo(LedgerAccount::class, 'ledger_account_id');
    }

    public function transaction()
    {
        return $this->belongsTo(LedgerTransaction::class, 'ledger_transaction_id');
    }
}