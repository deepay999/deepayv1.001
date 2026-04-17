<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardPoint extends Model {

    protected $fillable = [
        'user_id',
        'points',
        'type',
        'source',
        'reference_type',
        'reference_id',
        'description',
    ];

    protected $casts = [
        'points' => 'double',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
