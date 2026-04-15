<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Points extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id','balance'];

    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function logs(): HasMany      { return $this->hasMany(PointsLog::class,'user_id','user_id'); }
}
