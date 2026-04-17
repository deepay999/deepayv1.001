<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id','amount','currency','status','provider_payment_id','provider_raw',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'provider_raw' => 'array',
        'created_at'   => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function ledgerEntry()
    {
        return LedgerEntry::where('reference_id', 'payment:'.$this->id)->first();
    }
}
