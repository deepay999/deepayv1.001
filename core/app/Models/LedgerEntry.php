<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model {

    protected $fillable = [
        'user_id',
        'currency',
        'amount',
        'type',
        'reference_type',
        'reference_id',
        'description',
        'idempotency_key',
        'running_balance',
    ];

    protected $casts = [
        'amount'          => 'double',
        'running_balance' => 'double',
    ];

    // Ledger is immutable – disallow updates
    public static function boot(): void {
        parent::boot();

        static::updating(function () {
            throw new \RuntimeException('Ledger entries are immutable and cannot be updated.');
        });

        static::deleting(function () {
            throw new \RuntimeException('Ledger entries are immutable and cannot be deleted.');
        });
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
