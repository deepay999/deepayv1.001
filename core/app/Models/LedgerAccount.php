<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerAccount extends Model
{
    protected $fillable = [
        'account_type',
        'owner_id',
        'account_code',
        'currency',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function entries()
    {
        return $this->hasMany(LedgerEntry::class);
    }

    public function walletBalance()
    {
        return $this->hasOne(WalletBalance::class, 'account_code', 'account_code')
            ->where('currency', $this->currency);
    }
}