<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SwanAccount extends Model
{
    protected $fillable = [
        'user_id',
        'swan_account_id',
        'iban',
        'bic',
        'account_holder_name',
        'status',
        'currency',
        'swan_payload',
        'activated_at',
    ];

    protected $casts = [
        'swan_payload' => 'array',
        'activated_at' => 'datetime',
        'status'       => 'integer',
    ];

    // Status constants
    const STATUS_PENDING   = 0;
    const STATUS_ACTIVE    = 1;
    const STATUS_SUSPENDED = 2;
    const STATUS_CLOSED    = 9;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
