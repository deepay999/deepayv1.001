<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletBalance extends Model
{
    protected $fillable = [
        'account_type',
        'owner_id',
        'account_code',
        'currency',
        'available_balance',
        'pending_balance',
        'reserved_balance',
        'last_ledger_entry_id',
    ];

    protected $casts = [
        'available_balance' => 'decimal:8',
        'pending_balance' => 'decimal:8',
        'reserved_balance' => 'decimal:8',
    ];
}