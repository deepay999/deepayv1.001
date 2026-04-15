<?php

namespace App\Models;

use App\Traits\ApiQuery;
use App\Traits\GlobalStatus;
use Illuminate\Database\Eloquent\Model;

class MobileOperator extends Model
{
    use GlobalStatus, ApiQuery;

    protected $casts = [
        'fixed_charge'   => 'double',
        'percent_charge' => 'double',
        'status'         => 'integer',
    ];
}
