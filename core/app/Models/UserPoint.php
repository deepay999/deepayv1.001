<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPoint extends Model
{
    protected $fillable = ['user_id', 'points', 'type', 'description', 'reference_id', 'reference_type'];

    protected $casts = [
        'points' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function earn(int $userId, int $points, string $description, string $referenceId = null, string $referenceType = null): self
    {
        $record = self::create([
            'user_id'        => $userId,
            'points'         => abs($points),
            'type'           => 'earn',
            'description'    => $description,
            'reference_id'   => $referenceId,
            'reference_type' => $referenceType,
        ]);

        User::where('id', $userId)->increment('points', abs($points));

        return $record;
    }

    public static function adminAdd(int $userId, int $points, string $description): self
    {
        $record = self::create([
            'user_id'     => $userId,
            'points'      => abs($points),
            'type'        => 'admin_add',
            'description' => $description,
        ]);

        User::where('id', $userId)->increment('points', abs($points));

        return $record;
    }

    public static function adminDeduct(int $userId, int $points, string $description): self
    {
        $record = self::create([
            'user_id'     => $userId,
            'points'      => -abs($points),
            'type'        => 'admin_deduct',
            'description' => $description,
        ]);

        User::where('id', $userId)->decrement('points', abs($points));

        return $record;
    }

    public static function redeem(int $userId, int $points, string $description, string $referenceId = null): self
    {
        $record = self::create([
            'user_id'      => $userId,
            'points'       => -abs($points),
            'type'         => 'redeem',
            'description'  => $description,
            'reference_id' => $referenceId,
        ]);

        User::where('id', $userId)->decrement('points', abs($points));

        return $record;
    }
}
