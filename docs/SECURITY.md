# DeePay — Security Reference

---

## 1. Admin 2FA (Google Authenticator)

### Setup flow

```
Admin logs in → /admin/twofactor → scans QR → enters OTP → 2FA enabled
                                                    │
                                        (stored: admins.ts = 1, admins.tsc = secret)
```

### Enforcement

The `AdminForce2FA` middleware (`admin.2fa`) runs on **all admin routes** except:
- The login / logout pages
- The 2FA verify page itself (`/admin/twofactor/verify`)
- The 2FA setup page (`/admin/twofactor`)
- Password reset pages

If an admin has `ts = 1` and the session flag `admin_2fa_verified` is not set, they are redirected to `/admin/twofactor/verify`.

### Throttling

OTP verification is throttled per `admin_id + IP`:
- **5 failed attempts** within 10 minutes → account locked for 10 minutes
- Lock is stored in Laravel cache (Redis or file)

### Admin panel routes

| Route | Purpose |
|---|---|
| `GET /admin/twofactor` | Setup/disable 2FA |
| `POST /admin/twofactor/enable` | Enable with first OTP confirmation |
| `POST /admin/twofactor/disable` | Disable with OTP confirmation |
| `GET /admin/twofactor/verify` | OTP verification (post-login) |
| `POST /admin/twofactor/verify` | Submit OTP |

---

## 2. /clear route protection

The `/clear` route runs `artisan optimize:clear`. It is now **restricted**:

- Requests from `127.0.0.1` / `::1` / private networks (`10.*`, `192.168.*`) are allowed
- External requests must include `?secret=<CLEAR_CACHE_SECRET>` (set in `.env`)
- All other requests get `HTTP 403`

```
# .env
CLEAR_CACHE_SECRET=your-random-secret-here
```

---

## 3. Multi-guard authentication

See [AUTH.md](AUTH.md) for the full guard/token reference.

Key rule: **never mix guards**. An agent token sent to a user endpoint (or vice versa) will be rejected by the `token.permission` middleware.

---

## 4. Secrets management

| Secret | Where | Notes |
|---|---|---|
| `APP_KEY` | `.env` | Generated once with `artisan key:generate`; never commit |
| DB credentials | `.env` | Never commit to git |
| Alipay private key | Admin → Gateways | Stored encrypted in DB; never written to logs |
| OAuth credentials | Admin → General Settings | Stored in `general_settings.socialite_credentials` |
| `CLEAR_CACHE_SECRET` | `.env` | Random string; rotate if leaked |
| Deploy SSH key | GitHub Secrets | `DEPLOY_SSH_KEY`; must be ed25519 |

### Rules enforced by `.gitignore`

- `*.env` — never committed
- `*.sql`, `*.dump` — no database dumps in the repo
- `*.zip` — no large archives; use GitHub Releases instead
- `*.pem`, `*.key` — no private keys

---

## 5. Nginx security headers

The recommended Nginx config (see [NGINX.md](../NGINX.md)) includes:

```nginx
location ~ /\.(?!well-known).* { deny all; }   # no hidden files
location ~ /core/storage/       { deny all; }   # no direct storage access
location ~ /core/bootstrap/     { deny all; }   # no bootstrap cache
location ~* \.(env|log|bak|sql|zip|git)$ { deny all; }
```

---

## 6. Hardening checklist (production)

- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] Admin 2FA enabled for all admin accounts
- [ ] `/admin/*` restricted to VPN/office IP in Nginx
- [ ] `/clear` route uses `CLEAR_CACHE_SECRET` or disabled
- [ ] `php artisan storage:link` run — no direct access to `core/storage`
- [ ] DB credentials in `.env`, not hardcoded
- [ ] SSL/TLS enabled (HTTPS only)
- [ ] PHP `display_errors = off` in PHP-FPM pool config
- [ ] `open_basedir` set to site path only (see `deploy/fix-server.sh`)
- [ ] Large ZIP/SQL files removed from `main` branch (use Releases)

---

*See also: [AUTH.md](AUTH.md) • [ROUTING.md](ROUTING.md) • [PAYMENTS.md](PAYMENTS.md)*
