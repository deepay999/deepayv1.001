# DeePay — Nginx Configuration Guide

## Required Nginx Server Block

The following configuration is required for the DeePay homepage (React SPA + Laravel hybrid) to work correctly.

**Key points:**
1. Static assets (JS, CSS, images) must be served by Nginx directly — **never** forwarded to PHP/Laravel
2. Navigation/HTML requests must go to Laravel (`/index.php`)
3. The `dist/` folder (pre-built React bundle) must be accessible as static files

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name deepay.srl www.deepay.srl;

    # Root is the repository root (where index.php lives)
    root /var/www/deepayv1.001;
    index index.php;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # ── 1. Pre-built React bundle ────────────────────────────────
    # These files MUST be served as static files with correct MIME types.
    # If Nginx forwards them to PHP, the browser gets HTML instead of JS/CSS
    # → React fails to mount → startup shell is stuck.
    location /dist/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # ── 2. General static assets (template CSS/JS/images) ────────
    location ~* \.(css|js|mjs|map|png|jpg|jpeg|gif|svg|ico|webp|ttf|otf|woff|woff2)$ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # ── 3. PWA files — no caching so updates are instant ─────────
    location = /sw.js {
        try_files $uri =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }
    location = /manifest.json {
        try_files $uri =404;
        add_header Cache-Control "no-cache";
    }

    # ── 4. SPA / Laravel — everything else goes through PHP ──────
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # ── 5. PHP-FPM ───────────────────────────────────────────────
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;  # adjust PHP version
        fastcgi_hide_header X-Powered-By;
    }

    # ── 6. Security ───────────────────────────────────────────────
    location ~ /\.(?!well-known).* { deny all; }
    location ~ /core/storage/       { deny all; }
    location ~ /core/bootstrap/     { deny all; }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name deepay.srl www.deepay.srl;
    return 301 https://$host$request_uri;
}
```

---

## Troubleshooting: "Startup shell stuck, React doesn't mount"

### Step 1 — Check that JS assets load correctly

```
curl -I https://deepay.srl/dist/assets/app.js
```

You should see:
- **HTTP/2 200**
- `content-type: application/javascript` (NOT `text/html`)

If you see `text/html` for a `.js` file, Nginx is forwarding the request to Laravel. Fix: add the `/dist/` location block above.

### Step 2 — Clear stale Service Worker cache

The service worker may have cached an old startup shell. In Chrome:
1. Open DevTools → **Application** → **Service Workers**
2. Click **Unregister** (for `deepay.srl`)
3. Then: Application → **Storage** → **Clear site data**
4. Hard-reload: `Ctrl+Shift+R`

The new `sw.js` (v3) never caches HTML responses, so this issue won't recur after deployment.

### Step 3 — Verify dist/ files are deployed

```bash
ls -la /var/www/deepayv1.001/dist/assets/
# Expected:
#   app.js       (~420 KB) — React bundle
#   index.css    (~27 KB)  — Tailwind styles
#   favicon.png
#   manifest.json
```

If `dist/` is missing, run on the server:
```bash
cd /var/www/deepayv1.001
npm install
npm run build
```

### Step 4 — Check PHP/Laravel is returning the homepage correctly

```bash
curl -s https://deepay.srl/ | grep -c 'deepay-startup-shell'
# Should return: 1
```

---

## PWA / "Add to Home Screen"

- **Android / Chrome**: Users see the browser install prompt automatically
- **iOS / Safari**: Users see an in-app banner (shown by `home.blade.php`) instructing them to use Safari's Share → "Add to Home Screen"
- The manifest is at `/manifest.json` with `display: "standalone"` and shortcuts for Ricarica, Scansiona, Trasferisci

---

## Architecture

```
Request: GET /
   │
   ├── Nginx: static file? (/dist/, /assets/, *.js, *.css)
   │     └── Serve directly (correct MIME, long cache)
   │
   └── Nginx: everything else
         └── Laravel (index.php → home.blade.php)
               └── Returns HTML shell with:
                     - Startup shell (CSS only, no JS needed)
                     - <div id="root">
                     - <script src="/dist/assets/app.js">
                           │
                           ├── Mobile device detected?
                           │     └── Render App.tsx (banking PWA)
                           │           Tabs: Home · Cripto · Carte · Portafoglio · QR
                           │
                           └── Desktop?
                                 └── Render DeepayLandingPage.tsx
                                       Hero + KPIs + Features + CTA
```
