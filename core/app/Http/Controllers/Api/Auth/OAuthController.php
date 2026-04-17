<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Lib\SocialLogin;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

/**
 * API OAuth Controller — User
 *
 * POST /api/oauth/{provider}
 *   Body: { "token": "<provider_access_token>" }
 *   Returns: { "access_token": "...", "token_type": "Bearer", "user": {...} }
 *
 * The mobile app completes the OAuth flow on device, then sends the
 * provider access token here to mint a Sanctum token.
 */
class OAuthController extends Controller
{
    protected string $userType = 'user';

    public function __invoke(Request $request, string $provider): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            $this->configureProvider($provider);
            $socialUser = Socialite::driver($provider)->userFromToken($request->token);
        } catch (\Exception $e) {
            return response()->json([
                'remark'  => 'oauth_error',
                'status'  => 'error',
                'message' => ['Invalid or expired provider token'],
            ], 401);
        }

        $binding = SocialAccount::findBinding($provider, $socialUser->getId(), $this->userType);
        $account = null;

        if ($binding) {
            $account = $binding->owner();
        } else {
            $sl      = new SocialLogin($provider, $this->userType);
            // Use reflection to access the private findOrCreateAccount helper
            $method  = new \ReflectionMethod($sl, 'findOrCreateAccount');
            $method->setAccessible(true);
            $account = $method->invoke($sl, $socialUser);

            SocialAccount::create([
                'provider'    => $provider,
                'provider_id' => $socialUser->getId(),
                'user_type'   => $this->userType,
                'user_id'     => $account->id,
                'name'        => $socialUser->getName(),
                'email'       => $socialUser->getEmail(),
                'avatar'      => $socialUser->getAvatar(),
            ]);
        }

        if (!$account) {
            return response()->json([
                'remark'  => 'account_error',
                'status'  => 'error',
                'message' => ['Could not resolve account'],
            ], 500);
        }

        $tokenName  = $this->userType . '_token';
        $tokenAbility = [$tokenName];
        $token      = $account->createToken($tokenName, $tokenAbility)->plainTextToken;

        return response()->json([
            'remark'       => 'oauth_success',
            'status'       => 'success',
            'message'      => ['Logged in via ' . $provider],
            'data'         => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                $this->userType => $account,
            ],
        ]);
    }

    private function configureProvider(string $provider): void
    {
        $gs          = gs();
        $credentials = $gs->socialite_credentials ?? null;

        if ($credentials && isset($credentials->{$provider})) {
            $cfg = $credentials->{$provider};
            config([
                "services.{$provider}.client_id"     => $cfg->client_id ?? '',
                "services.{$provider}.client_secret" => $cfg->client_secret ?? '',
                "services.{$provider}.redirect"      => url('/'),
            ]);
        }
    }
}
