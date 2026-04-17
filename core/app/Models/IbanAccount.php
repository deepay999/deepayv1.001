<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IbanAccount extends Model
{
    public $timestamps = false;
    protected $table   = 'iban_accounts';

    protected $fillable = ['user_id','iban','bic','provider','swan_account_id','status'];

    protected $casts = ['created_at' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
