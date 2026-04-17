<?php

namespace App\Lib;

use App\Models\Agent;
use App\Models\Merchant;
use App\Models\SocialAccount;
use App\Models\User;
use App\Models\UserLogin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

/**
 * SocialLogin
 *
 * Handles OAuth login for all three account types: user, agent, merchant.
 *
 * Usage:
 *   $sl = new SocialLogin($provider, 'user');   // 'user' | 'agent' | 'merchant'
 *   return $sl->redirectDriver();
 *   // … in callback:
 *   return $sl->login();
 */
class SocialLogin
{
    protected string $provider;
    protected string $userType;   // user | agent | merchant

    public function __construct(string $provider, string $userType = 'user')
    {
        $this->provider  = strtolower($provider);
        $this->userType  = $userType;
    }

    /**
     * Redirect to the OAuth provider.
     */
    public function redirectDriver(): mixed
    {
        $this->configureSocialite();
        return Socialite::driver($this->provider)->redirect();
    }

    /**
     * Handle the OAuth callback, find-or-create the account, log in, and redirect.
     */
    public function login(): mixed
    {
        $this->configureSocialite();
        $socialUser = Socialite::driver($this->provider)->user();

        // Find an existing social account binding
        $binding = SocialAccount::findBinding($this->provider, $socialUser->getId(), $this->userType);

        if ($binding) {
            $account = $binding->owner();
            if (!$account) {
                throw new \RuntimeException('Linked account no longer exists.');
            }
        } else {
            // Try to match by e-mail, or create a new account
            $account = $this->findOrCreateAccount($socialUser);

            // Save the binding
            SocialAccount::create([
                'provider'    => $this->provider,
                'provider_id' => $socialUser->getId(),
                'user_type'   => $this->userType,
                'user_id'     => $account->id,
                'name'        => $socialUser->getName(),
                'email'       => $socialUser->getEmail(),
                'avatar'      => $socialUser->getAvatar(),
            ]);
        }

        $this->logLoginAttempt($account);
        $this->guard()->login($account);

        return $this->redirectAfterLogin();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Configure Socialite with credentials stored in GeneralSetting or .env.
     */
    private function configureSocialite(): void
    {
        $gs          = gs();
        $credentials = $gs->socialite_credentials ?? null;

        if ($credentials && isset($credentials->{$this->provider})) {
            $cfg = $credentials->{$this->provider};
            config([
                "services.{$this->provider}.client_id"     => $cfg->client_id ?? '',
                "services.{$this->provider}.client_secret" => $cfg->client_secret ?? '',
                "services.{$this->provider}.redirect"      => $this->callbackUrl(),
            ]);
        } else {
            // Fall back to env (GOOGLE_CLIENT_ID, etc.)
            config([
                "services.{$this->provider}.redirect" => $this->callbackUrl(),
            ]);
        }
    }

    /**
     * Generate the correct callback URL for this user type.
     */
    private function callbackUrl(): string
    {
        return match ($this->userType) {
            'agent'    => route('agent.social.login.callback', ['provider' => $this->provider]),
            'merchant' => route('merchant.social.login.callback', ['provider' => $this->provider]),
            default    => route('user.social.login.callback', ['provider' => $this->provider]),
        };
    }

    /**
     * Return the correct Auth guard for this user type.
     */
    private function guard(): \Illuminate\Contracts\Auth\Guard
    {
        return match ($this->userType) {
            'agent'    => Auth::guard('agent'),
            'merchant' => Auth::guard('merchant'),
            default    => Auth::guard('web'),
        };
    }

    /**
     * Find an existing account by email, or create a minimal new one.
     */
    private function findOrCreateAccount(mixed $socialUser): mixed
    {
        $email = $socialUser->getEmail();

        return match ($this->userType) {
            'agent'    => $this->findOrCreateAgent($socialUser, $email),
            'merchant' => $this->findOrCreateMerchant($socialUser, $email),
            default    => $this->findOrCreateUser($socialUser, $email),
        };
    }

    private function findOrCreateUser(mixed $socialUser, ?string $email): User
    {
        if ($email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                return $user;
            }
        }

        return User::create([
            'username'     => $this->generateUsername($socialUser->getName() ?? $email ?? 'user'),
            'email'        => $email,
            'firstname'    => $socialUser->getName() ?? '',
            'lastname'     => '',
            'password'     => bcrypt(Str::random(32)),
            'ev'           => 1,
            'sv'           => 0,
            'ts'           => 0,
        ]);
    }

    private function findOrCreateAgent(mixed $socialUser, ?string $email): Agent
    {
        if ($email) {
            $agent = Agent::where('email', $email)->first();
            if ($agent) {
                return $agent;
            }
        }

        return Agent::create([
            'username'  => $this->generateUsername($socialUser->getName() ?? $email ?? 'agent', 'agent'),
            'email'     => $email,
            'firstname' => $socialUser->getName() ?? '',
            'lastname'  => '',
            'password'  => bcrypt(Str::random(32)),
            'ev'        => 1,
            'sv'        => 0,
            'ts'        => 0,
        ]);
    }

    private function findOrCreateMerchant(mixed $socialUser, ?string $email): Merchant
    {
        if ($email) {
            $merchant = Merchant::where('email', $email)->first();
            if ($merchant) {
                return $merchant;
            }
        }

        return Merchant::create([
            'username'  => $this->generateUsername($socialUser->getName() ?? $email ?? 'merchant', 'merchant'),
            'email'     => $email,
            'firstname' => $socialUser->getName() ?? '',
            'lastname'  => '',
            'password'  => bcrypt(Str::random(32)),
            'ev'        => 1,
            'sv'        => 0,
            'ts'        => 0,
        ]);
    }

    private function generateUsername(string $base, string $prefix = ''): string
    {
        $slug = Str::slug(strtolower($base), '');
        $slug = $prefix ? $prefix . '_' . $slug : $slug;
        $slug = substr($slug, 0, 15);

        $username = $slug;
        $i        = 1;
        while ($this->usernameExists($username)) {
            $username = $slug . $i++;
        }
        return $username;
    }

    private function usernameExists(string $username): bool
    {
        return match ($this->userType) {
            'agent'    => Agent::where('username', $username)->exists(),
            'merchant' => Merchant::where('username', $username)->exists(),
            default    => User::where('username', $username)->exists(),
        };
    }

    private function logLoginAttempt(mixed $account): void
    {
        try {
            $ip    = getRealIP();
            $exist = UserLogin::where('user_ip', $ip)->first();
            $log   = new UserLogin();

            if ($exist) {
                $log->longitude    = $exist->longitude;
                $log->latitude     = $exist->latitude;
                $log->city         = $exist->city;
                $log->country_code = $exist->country_code;
                $log->country      = $exist->country;
            } else {
                $info              = json_decode(json_encode(getIpInfo()), true);
                $log->longitude    = @implode(',', $info['long']);
                $log->latitude     = @implode(',', $info['lat']);
                $log->city         = @implode(',', $info['city']);
                $log->country_code = @implode(',', $info['code']);
                $log->country      = @implode(',', $info['country']);
            }

            $agent        = osBrowser();
            $log->user_ip = $ip;
            $log->browser = @$agent['browser'];
            $log->os      = @$agent['os_platform'];

            match ($this->userType) {
                'agent'    => $log->agent_id    = $account->id,
                'merchant' => $log->merchant_id = $account->id,
                default    => $log->user_id      = $account->id,
            };

            $log->save();
        } catch (\Throwable) {
            // Non-fatal — login tracking failure must not block the login itself
        }
    }

    private function redirectAfterLogin(): mixed
    {
        return match ($this->userType) {
            'agent'    => to_route('agent.home'),
            'merchant' => to_route('merchant.home'),
            default    => to_route('user.home'),
        };
    }
}
