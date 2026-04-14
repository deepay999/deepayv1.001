<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardPointLedger extends Model
{
    protected $table = 'reward_point_ledger';

    protected $fillable = [
        'user_id',
        'trx',
        'entry_type',
        'points',
        'running_balance',
        'description',
        'source',
        'reference_id',
        'expires_at',
        'meta',
    ];

    protected $casts = [
        'points'          => 'integer',
        'running_balance' => 'integer',
        'expires_at'      => 'datetime',
        'meta'            => 'array',
    ];

    const TYPE_EARN   = 'earn';
    const TYPE_REDEEM = 'redeem';
    const TYPE_EXPIRE = 'expire';
    const TYPE_ADJUST = 'adjust';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeEarned($query)
    {
        return $query->where('entry_type', self::TYPE_EARN);
    }

    public function scopeRedeemed($query)
    {
        return $query->where('entry_type', self::TYPE_REDEEM);
    }

    /**
     * Only entries that haven't expired
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }
}
