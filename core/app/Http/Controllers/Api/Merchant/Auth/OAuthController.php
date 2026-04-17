<?php

namespace App\Http\Controllers\Api\Merchant\Auth;

use App\Http\Controllers\Api\Auth\OAuthController as BaseOAuthController;

/**
 * API OAuth — Merchant
 * POST /api/merchant/oauth/{provider}
 */
class OAuthController extends BaseOAuthController
{
    protected string $userType = 'merchant';
}
