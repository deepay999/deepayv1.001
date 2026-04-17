<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Point extends Model {

    protected $fillable = ['user_id', 'amount', 'type', 'description', 'trx'];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function scopeEarned($query) {
        return $query->where('type', 'earn');
    }

    public function scopeUsed($query) {
        return $query->where('type', 'use');
    }
}
