<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Polymorphic OAuth binding table.
 *
 * Columns: provider, provider_id, user_type (user|agent|merchant), user_id
 */
class SocialAccount extends Model
{
    protected $fillable = [
        'provider',
        'provider_id',
        'user_type',
        'user_id',
        'name',
        'email',
        'avatar',
    ];

    /**
     * Find an existing binding or return null.
     */
    public static function findBinding(string $provider, string $providerId, string $userType): ?self
    {
        return static::where('provider', $provider)
            ->where('provider_id', $providerId)
            ->where('user_type', $userType)
            ->first();
    }

    /**
     * Resolve the owning user/agent/merchant model instance.
     */
    public function owner(): mixed
    {
        $map = [
            'user'     => \App\Models\User::class,
            'agent'    => \App\Models\Agent::class,
            'merchant' => \App\Models\Merchant::class,
        ];
        $class = $map[$this->user_type] ?? null;
        if (!$class) {
            return null;
        }
        return $class::find($this->user_id);
    }
}
