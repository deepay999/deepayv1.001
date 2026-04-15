<?php

namespace App\Http\Controllers\Api\Agent\Auth;

use App\Http\Controllers\Api\Auth\OAuthController as BaseOAuthController;

/**
 * API OAuth — Agent
 * POST /api/agent/oauth/{provider}
 */
class OAuthController extends BaseOAuthController
{
    protected string $userType = 'agent';
}
