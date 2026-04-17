<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PawWithdrawal — named to avoid collision with existing Withdrawal model.
 */
class PawWithdrawal extends Model
{
    public $timestamps = false;
    protected $table   = 'withdrawals';

    protected $fillable = ['user_id','amount','currency','method','status','provider_reference','meta'];

    protected $casts = [
        'amount'     => 'decimal:2',
        'meta'       => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function ledgerEntry()
    {
        return LedgerEntry::where('reference_id', 'withdrawal:'.$this->id)->first();
    }
}
