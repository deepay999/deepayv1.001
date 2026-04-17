# DeePay — Authentication & API Token Permissions

This document describes all Auth guards, their scope, and the Sanctum token abilities used in DeePay.

---

## 1. Web guards

| Guard name | Model | Session key | Login route |
|---|---|---|---|
| `web` (default) | `App\Models\User` | `login_web_*` | `/user/login` |
| `agent` | `App\Models\Agent` | `login_agent_*` | `/agent/login` |
| `merchant` | `App\Models\Merchant` | `login_merchant_*` | `/merchant/login` |
| `admin` | `App\Models\Admin` | `login_admin_*` | `/admin/` |

### Usage in controllers / middleware

```php
// Current logged-in user (web guard)
auth()->user();
auth('web')->user();

// Current logged-in agent
auth('agent')->user();

// Current logged-in merchant
auth('merchant')->user();

// Current logged-in admin
auth('admin')->user();
```

### Middleware aliases

| Alias | Protects | Redirects to |
|---|---|---|
| `auth` | User routes | `/user/login` |
| `agent` | Agent routes | `/agent/login` |
| `merchant` | Merchant routes | `/merchant/login` |
| `admin` | Admin routes | `/admin/` |
| `admin.guest` | Guest-only admin pages | `/admin/dashboard` |
| `admin.2fa` | Admin routes (2FA step) | `/admin/twofactor/verify` |

---

## 2. API token abilities (Sanctum)

Tokens are created with a single ability that identifies the account type.

| Ability | Created by | Accepted by |
|---|---|---|
| `user_token` | `auth:sanctum` (User login/OAuth) | `token.permission:user_token` middleware |
| `agent_token` | `auth:sanctum` (Agent login/OAuth) | `token.permission:agent_token` middleware |
| `merchant_token` | `auth:sanctum` (Merchant login/OAuth) | `token.permission:merchant_token` middleware |

### Example: create a token

```php
// User
$token = $user->createToken('user_token', ['user_token'])->plainTextToken;

// Agent
$token = $agent->createToken('agent_token', ['agent_token'])->plainTextToken;

// Merchant
$token = $merchant->createToken('merchant_token', ['merchant_token'])->plainTextToken;
```

### Example: protect a route

```php
// Only user tokens accepted
Route::middleware(['auth:sanctum', 'token.permission:user_token'])->group(function () {
    Route::get('dashboard', ...);
});

// Only agent tokens accepted
Route::middleware(['auth:sanctum', 'token.permission:agent_token'])->group(function () {
    Route::get('agent/dashboard', ...);
});
```

---

## 3. OAuth / Social login (Web + API)

Social login is implemented via `App\Lib\SocialLogin` and uses the credentials stored in `GeneralSetting.socialite_credentials` (set via admin panel) or fallback env variables.

### Web routes

| Route | Guard | Controller |
|---|---|---|
| `/user/social-login/{provider}` | web | `User\Auth\SocialiteController@socialLogin` |
| `/user/social-login/callback/{provider}` | web | `User\Auth\SocialiteController@callback` |
| `/agent/social-login/{provider}` | agent | `Agent\Auth\SocialiteController@socialLogin` |
| `/agent/social-login/callback/{provider}` | agent | `Agent\Auth\SocialiteController@callback` |
| `/merchant/social-login/{provider}` | merchant | `Merchant\Auth\SocialiteController@socialLogin` |
| `/merchant/social-login/callback/{provider}` | merchant | `Merchant\Auth\SocialiteController@callback` |

### API routes (mobile — token-based)

```
POST /api/oauth/{provider}          body: { "token": "<provider_access_token>" }
POST /api/agent/oauth/{provider}    body: { "token": "<provider_access_token>" }
POST /api/merchant/oauth/{provider} body: { "token": "<provider_access_token>" }
```

Response:
```json
{
  "remark": "oauth_success",
  "status": "success",
  "data": {
    "access_token": "...",
    "token_type": "Bearer",
    "user": { ... }
  }
}
```

### `social_accounts` table

The `social_accounts` table links provider identities to local accounts and prevents cross-type collisions:

| Column | Type | Notes |
|---|---|---|
| `provider` | string | e.g. `google`, `facebook` |
| `provider_id` | string | Provider's unique user ID |
| `user_type` | string | `user` / `agent` / `merchant` |
| `user_id` | bigint | FK to the account in the respective table |
| `email` | string | Cached provider email (for display) |

**Unique constraint**: `(provider, provider_id, user_type)` — the same Google account can be bound to one user **and** one agent, but not two users.

---

## 4. Common pitfalls

| Issue | Explanation | Fix |
|---|---|---|
| Guard mismatch | Using `auth()->user()` in an agent controller returns `null` | Use `auth('agent')->user()` |
| Wrong token ability | Agent token sent to a user-only endpoint returns 401 | Client must use the correct endpoint for the account type |
| Cross-type OAuth | Same Google account bound to two users of the same type | `social_accounts` unique constraint prevents this |
| 2FA not enforced on admin | Admin logs in but can access everything without OTP | Apply `admin.2fa` middleware to admin route group |
| Missing `storage:link` | Uploaded images return 404 | Run `php index.php artisan storage:link` |

---

*See also: [ROUTING.md](ROUTING.md) • [SECURITY.md](SECURITY.md)*
