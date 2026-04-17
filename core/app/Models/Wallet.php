<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model {

    protected $fillable = [
        'user_id',
        'currency',
        'frozen_amount',
        'is_active',
    ];

    protected $casts = [
        'frozen_amount' => 'double',
        'is_active'     => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * Available balance = ledger sum − frozen_amount
     */
    public function getAvailableBalanceAttribute(): float {
        $total = LedgerEntry::where('user_id', $this->user_id)
            ->where('currency', $this->currency)
            ->sum('amount');

        return max(0, (float) $total - (float) $this->frozen_amount);
    }

    /**
     * Total ledger balance (before deducting frozen)
     */
    public function getTotalBalanceAttribute(): float {
        return (float) LedgerEntry::where('user_id', $this->user_id)
            ->where('currency', $this->currency)
            ->sum('amount');
    }
}
