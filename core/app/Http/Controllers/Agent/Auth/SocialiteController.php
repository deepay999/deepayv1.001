<?php

namespace App\Http\Controllers\Agent\Auth;

use App\Http\Controllers\Controller;
use App\Lib\SocialLogin;

class SocialiteController extends Controller
{
    public function socialLogin(string $provider): mixed
    {
        $sl = new SocialLogin($provider, 'agent');
        return $sl->redirectDriver();
    }

    public function callback(string $provider): mixed
    {
        $sl = new SocialLogin($provider, 'agent');
        try {
            return $sl->login();
        } catch (\Exception $e) {
            $notify[] = ['error', $e->getMessage()];
            return to_route('agent.login')->withNotify($notify);
        }
    }
}
