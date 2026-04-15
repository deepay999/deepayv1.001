<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerTransaction extends Model
{
    protected $fillable = [
        'transaction_uuid',
        'event_type',
        'reference_type',
        'reference_id',
        'idempotency_key',
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
}