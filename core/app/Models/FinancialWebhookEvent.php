<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialWebhookEvent extends Model
{
    protected $fillable = [
        'provider',
        'event_id',
        'event_type',
        'signature_valid',
        'received_at',
        'event_timestamp',
        'payload',
        'payload_hash',
        'processing_status',
        'linked_reference_type',
        'linked_reference_id',
        'error_message',
    ];

    protected $casts = [
        'signature_valid' => 'boolean',
        'received_at' => 'datetime',
        'event_timestamp' => 'datetime',
        'payload' => 'array',
    ];
}