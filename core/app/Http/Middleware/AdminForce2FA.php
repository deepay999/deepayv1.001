<?php

namespace App\Http\Middleware;

use App\Constants\Status;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * AdminForce2FA
 *
 * After a successful admin login, if the admin has 2FA enabled this middleware
 * forces them through the OTP verification step before accessing any other
 * admin page.
 *
 * Session key: admin_2fa_verified (bool)
 *
 * Allowed-through routes (no 2FA check):
 *  - admin.login
 *  - admin.logout
 *  - admin.twofactor.verify (the OTP form itself)
 *  - admin.twofactor (the setup page — so admins can still enable/disable)
 */
class AdminForce2FA
{
    /** Routes that bypass the 2FA check. */
    private const BYPASSED_ROUTES = [
        'admin.login',
        'admin.logout',
        'admin.2fa.verify',
        'admin.2fa.verify.post',
        'admin.twofactor',
        'admin.twofactor.enable',
        'admin.twofactor.disable',
        'admin.password.reset',
        'admin.password.code.verify',
        'admin.password.change',
    ];

    public function handle(Request $request, Closure $next): mixed
    {
        $admin = Auth::guard('admin')->user();

        // Not logged in — let RedirectIfNotAdmin handle it
        if (!$admin) {
            return $next($request);
        }

        // 2FA not enabled for this admin — no check needed
        if ($admin->ts != Status::ENABLE) {
            return $next($request);
        }

        // Already verified this session
        if ($request->session()->get('admin_2fa_verified')) {
            return $next($request);
        }

        // Allow the verify/setup pages themselves (avoid redirect loop)
        $currentRoute = $request->route()?->getName();
        if ($currentRoute && in_array($currentRoute, self::BYPASSED_ROUTES)) {
            return $next($request);
        }

        // Redirect to OTP verification form
        return redirect()->route('admin.2fa.verify')
            ->with('intended', $request->fullUrl());
    }
}
