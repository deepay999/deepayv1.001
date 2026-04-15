<?php

namespace App\Http\Controllers\Admin;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\GoogleAuthenticator;
use Illuminate\Http\Request;

class AdminTwoFactorController extends Controller
{
    /**
     * Show the 2FA setup / status page.
     */
    public function show()
    {
        $ga        = new GoogleAuthenticator();
        $admin     = auth('admin')->user();
        $secret    = $ga->createSecret();
        $qrCodeUrl = $ga->getQRCodeGoogleUrl($admin->username . '@' . gs('site_name'), $secret);
        $pageTitle = '2FA Security';
        return view('admin.auth.twofactor', compact('pageTitle', 'secret', 'qrCodeUrl'));
    }

    /**
     * Enable 2FA — validate the first OTP before saving the secret.
     */
    public function enable(Request $request)
    {
        $request->validate([
            'key'  => 'required|string',
            'code' => 'required|string',
        ]);

        $admin    = auth('admin')->user();
        $response = verifyG2fa($admin, $request->code, $request->key);

        if ($response) {
            $admin->tsc = $request->key;
            $admin->ts  = Status::ENABLE;
            $admin->save();
            $notify[] = ['success', 'Two-factor authentication activated successfully'];
        } else {
            $notify[] = ['error', 'Wrong verification code'];
        }
        return back()->withNotify($notify);
    }

    /**
     * Disable 2FA — require current OTP to deactivate.
     */
    public function disable(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $admin    = auth('admin')->user();
        $response = verifyG2fa($admin, $request->code);

        if ($response) {
            $admin->tsc = null;
            $admin->ts  = Status::DISABLE;
            $admin->save();
            $notify[] = ['success', 'Two-factor authentication deactivated successfully'];
        } else {
            $notify[] = ['error', 'Wrong verification code'];
        }
        return back()->withNotify($notify);
    }

    /**
     * Show the OTP verification page (used by AdminForce2FA middleware).
     */
    public function verifyForm()
    {
        $pageTitle = '2FA Verification';
        return view('admin.auth.twofactor_verify', compact('pageTitle'));
    }

    /**
     * Process OTP verification with basic throttling.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $admin    = auth('admin')->user();
        $throttleKey = 'admin_2fa_' . $admin->id . '_' . $request->ip();

        // Max 5 attempts per 10 minutes
        if (cache()->get($throttleKey . '_locked')) {
            $notify[] = ['error', 'Too many attempts. Please try again after 10 minutes.'];
            return back()->withNotify($notify);
        }

        if (verifyG2fa($admin, $request->code)) {
            cache()->forget($throttleKey . '_attempts');
            cache()->forget($throttleKey . '_locked');
            session(['admin_2fa_verified' => true]);
            return redirect()->intended(route('admin.dashboard'));
        }

        $attempts = cache()->get($throttleKey . '_attempts', 0) + 1;
        cache()->put($throttleKey . '_attempts', $attempts, now()->addMinutes(10));

        if ($attempts >= 5) {
            cache()->put($throttleKey . '_locked', true, now()->addMinutes(10));
            $notify[] = ['error', 'Too many failed attempts. Your access is locked for 10 minutes.'];
        } else {
            $notify[] = ['error', 'Wrong verification code (' . (5 - $attempts) . ' attempts left)'];
        }

        return back()->withNotify($notify);
    }
}
