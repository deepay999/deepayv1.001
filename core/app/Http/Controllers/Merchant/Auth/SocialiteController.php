<?php

namespace App\Http\Controllers\Merchant\Auth;

use App\Http\Controllers\Controller;
use App\Lib\SocialLogin;

class SocialiteController extends Controller
{
    public function socialLogin(string $provider): mixed
    {
        $sl = new SocialLogin($provider, 'merchant');
        return $sl->redirectDriver();
    }

    public function callback(string $provider): mixed
    {
        $sl = new SocialLogin($provider, 'merchant');
        try {
            return $sl->login();
        } catch (\Exception $e) {
            $notify[] = ['error', $e->getMessage()];
            return to_route('merchant.login')->withNotify($notify);
        }
    }
}
