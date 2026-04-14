<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AirwallexPayout extends Model
{
    protected $fillable = [
        'user_id',
        'trx',
        'airwallex_transfer_id',
        'amount',
        'currency',
        'beneficiary_name',
        'beneficiary_account_number',
        'beneficiary_routing_number',
        'beneficiary_bank_name',
        'beneficiary_country',
        'payout_method',
        'reference',
        'status',
        'failure_reason',
        'airwallex_payload',
        'submitted_at',
        'completed_at',
    ];

    protected $casts = [
        'amount'            => 'float',
        'airwallex_payload' => 'array',
        'submitted_at'      => 'datetime',
        'completed_at'      => 'datetime',
        'status'            => 'integer',
    ];

    const STATUS_PENDING    = 0;
    const STATUS_PROCESSING = 1;
    const STATUS_COMPLETED  = 2;
    const STATUS_FAILED     = 3;
    const STATUS_CANCELLED  = 9;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ledgerEntries()
    {
        return $this->hasMany(WalletLedgerEntry::class);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}
