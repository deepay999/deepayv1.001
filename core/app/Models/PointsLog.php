<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointsLog extends Model
{
    public $timestamps = false;
    protected $table   = 'points_log';

    protected $fillable = ['user_id','type','amount','reason'];

    protected $casts = ['created_at' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
