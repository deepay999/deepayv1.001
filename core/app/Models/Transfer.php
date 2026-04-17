<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transfer extends Model
{
    public $timestamps = false;

    protected $fillable = ['from_user_id','to_user_id','amount','currency','status'];

    protected $casts = [
        'amount'     => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function sender(): BelongsTo   { return $this->belongsTo(User::class,'from_user_id'); }
    public function receiver(): BelongsTo { return $this->belongsTo(User::class,'to_user_id');   }

    public function ledgerEntries()
    {
        return LedgerEntry::where('reference_id', 'transfer:'.$this->id)->get();
    }
}
