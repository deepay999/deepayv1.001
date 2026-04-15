<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdempotencyKey extends Model
{
    protected $fillable = [
        'idempotency_key',
        'operation_type',
        'actor_type',
        'actor_id',
        'request_hash',
        'status',
        'resource_type',
        'resource_id',
        'response_code',
        'response_body',
        'first_seen_at',
        'last_seen_at',
        'expires_at',
    ];

    protected $casts = [
        'response_body' => 'array',
        'first_seen_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}