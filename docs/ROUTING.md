# DeePay — Routing Table

This document lists every HTTP entry-point in the application, its access level, and what server/firewall rules apply.

---

## 1. Public routes (must be reachable from the internet)

| Path | Method | Purpose | Notes |
|---|---|---|---|
| `/` | GET | Landing page / React PWA shell | Public |
| `/dist/*` | GET | Vite-built JS/CSS bundle | Served by Nginx directly |
| `/assets/*` | GET | Laravel template assets (CSS/JS/img) | Served by Nginx directly |
| `/manifest.json` | GET | PWA manifest | Public |
| `/sw.js` | GET | Service Worker | Public |
| `/user/login` | GET/POST | User login | Public |
| `/user/register` | GET/POST | User registration | Public |
| `/user/social-login/{provider}` | GET | User OAuth redirect | Public |
| `/user/social-login/callback/{provider}` | GET | User OAuth callback | Public |
| `/agent/login` | GET/POST | Agent login | Public |
| `/agent/register` | GET/POST | Agent registration | Public |
| `/agent/social-login/{provider}` | GET | Agent OAuth redirect | Public |
| `/agent/social-login/callback/{provider}` | GET | Agent OAuth callback | Public |
| `/merchant/login` | GET/POST | Merchant login | Public |
| `/merchant/register` | GET/POST | Merchant registration | Public |
| `/merchant/social-login/{provider}` | GET | Merchant OAuth redirect | Public |
| `/merchant/social-login/callback/{provider}` | GET | Merchant OAuth callback | Public |
| `/ipn/alipay` | POST | Alipay payment callback | **Must be public** — called by Alipay servers |
| `/ipn/*` | POST | All other IPN/payment callbacks | **Must be public** |
| `/api/authentication` | POST | User API login | Public |
| `/api/agent/authentication` | POST | Agent API login | Public |
| `/api/merchant/authentication` | POST | Merchant API login | Public |
| `/api/oauth/{provider}` | POST | User OAuth API login | Public |
| `/api/agent/oauth/{provider}` | POST | Agent OAuth API login | Public |
| `/api/merchant/oauth/{provider}` | POST | Merchant OAuth API login | Public |
| `/api/general-setting` | GET | App config | Public |
| `/ticket/*` | GET/POST | Public support ticket | Public |

---

## 2. Authenticated user routes (require valid session or Sanctum token)

| Prefix | Guard | Notes |
|---|---|---|
| `/user/*` (logged in) | `web` (auth) | Standard user area |
| `/agent/*` (logged in) | `agent` | Agent panel |
| `/merchant/*` (logged in) | `merchant` | Merchant panel |
| `/api/*` | `sanctum` + `user_token` | User API |
| `/api/agent/*` | `sanctum` + `agent_token` | Agent API |
| `/api/merchant/*` | `sanctum` + `merchant_token` | Merchant API |

---

## 3. Admin routes (restrict to internal / VPN only)

| Path | Access Level | Notes |
|---|---|---|
| `/admin` | Admin login | Consider restricting to office/VPN IP |
| `/admin/twofactor` | Admin (2FA setup) | 2FA enable/disable |
| `/admin/twofactor/verify` | Admin (2FA verify) | Shown after login when 2FA is enabled |
| `/admin/*` | Admin + 2FA | All other admin routes |

> **Deployment recommendation**: Restrict `/admin/*` to a known IP range at the Nginx or firewall level to prevent brute-force attacks.

---

## 4. Restricted / internal routes (⚠ must NOT be public)

| Path | Risk | Recommended fix |
|---|---|---|
| `/clear` | Runs `optimize:clear` — can be abused to DOS the cache | **Restricted**: only localhost/private IP or `?secret=<key>` (see `CLEAR_CACHE_SECRET` env var) |
| `/cron` | Triggers scheduled tasks | Restrict to your cron server IP; add a secret token |
| `/admin/*` | Full admin panel | Restrict to VPN/office IP at Nginx level |
| `/core/storage/*` | Raw storage files | **Denied** by Nginx — must never be publicly browsable |
| `/core/bootstrap/*` | Laravel bootstrap cache | **Denied** by Nginx |
| `*.env` | Environment secrets | **Denied** by Nginx + `.htaccess` |

---

## 5. Environment variables relevant to routing

| Variable | Example | Purpose |
|---|---|---|
| `APP_URL` | `https://deepay.srl` | Base URL used by `asset()` / `route()` helpers — wrong value causes broken images/CSS |
| `CLEAR_CACHE_SECRET` | `some-random-string` | Secret token required to call `/clear` from the internet |

---

## 6. Configuring IPN / callback URLs

When adding a payment gateway, use these IPN callback URLs:

| Gateway | Callback URL |
|---|---|
| Alipay | `https://deepay.srl/ipn/Alipay` |
| Other gateways | `https://deepay.srl/ipn/{GatewayAlias}` |

The IPN URL for Alipay's **return_url** (browser redirect after payment):
```
https://deepay.srl/ipn/Alipay?type=return
```

---

*See also: [AUTH.md](AUTH.md) • [PAYMENTS.md](PAYMENTS.md) • [SECURITY.md](SECURITY.md)*
