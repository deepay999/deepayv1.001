<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletLedgerEntry extends Model
{
    protected $fillable = [
        'trx',
        'entry_type',
        'user_id',
        'amount',
        'currency',
        'running_balance',
        'description',
        'remark',
        'related_user_id',
        'airwallex_payout_id',
        'swan_account_id',
        'meta',
    ];

    protected $casts = [
        'amount'          => 'float',
        'running_balance' => 'float',
        'meta'            => 'array',
    ];

    const ENTRY_DEBIT  = 'debit';
    const ENTRY_CREDIT = 'credit';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function relatedUser()
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }

    public function airwallexPayout()
    {
        return $this->belongsTo(AirwallexPayout::class);
    }

    public function swanAccount()
    {
        return $this->belongsTo(SwanAccount::class);
    }

    /**
     * Scopes
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCredits($query)
    {
        return $query->where('entry_type', self::ENTRY_CREDIT);
    }

    public function scopeDebits($query)
    {
        return $query->where('entry_type', self::ENTRY_DEBIT);
    }
}
