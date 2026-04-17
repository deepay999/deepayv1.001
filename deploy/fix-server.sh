#!/usr/bin/env bash
# =============================================================================
# deploy/fix-server.sh — Emergency fix for open_basedir misconfiguration
#
# Problem: PHP-FPM pool for www.deepay.srl is configured with modaui.com's
# open_basedir, causing "Operation not permitted" 500 errors on every request.
#
# Run as root: sudo bash deploy/fix-server.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[FIX]  $*${NC}"; }
ok()   { echo -e "${GREEN}[OK]   $*${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $*${NC}"; }
fail() { echo -e "${RED}[FAIL] $*${NC}" >&2; exit 1; }

SITE_DOMAIN="${SITE_DOMAIN:-www.deepay.srl}"
DEPLOY_PATH="${DEPLOY_PATH:-/www/wwwroot/${SITE_DOMAIN}}"
PHP_VERSION="${PHP_VERSION:-8.4}"
SITE_USER="${SITE_USER:-www}"
PHP_MAJOR_MINOR="${PHP_VERSION//./}"

# aaPanel / BT Panel paths
AAPANEL_PHP_POOL_DIR="/www/server/php/${PHP_MAJOR_MINOR}/etc/php-fpm.d"
AAPANEL_REWRITE_DIR="/www/server/panel/vhost/rewrite"
AAPANEL_REWRITE_CONF="${AAPANEL_REWRITE_DIR}/${SITE_DOMAIN}.conf"

log "==========================================="
log " DeePay Emergency open_basedir Fix"
log " Domain:  $SITE_DOMAIN"
log " Path:    $DEPLOY_PATH"
log " PHP:     $PHP_VERSION"
log "==========================================="

# ── 1. Diagnose current state ─────────────────────────────────────────────────
log "Diagnosing current PHP-FPM configuration..."

# Check active PHP-FPM service
PHP_FPM_SVC=""
for svc in "php${PHP_VERSION}-fpm" "php${PHP_MAJOR_MINOR}-fpm" "php-fpm83" "php-fpm"; do
    if systemctl is-active --quiet "$svc" 2>/dev/null; then
        PHP_FPM_SVC="$svc"
        ok "Found active PHP-FPM service: $svc"
        break
    fi
done

[[ -z "$PHP_FPM_SVC" ]] && fail "No active PHP-FPM service found. Is PHP-FPM installed?"

# Find pool config directories — aaPanel path takes priority
POOL_DIRS=(
    "${AAPANEL_PHP_POOL_DIR}"
    "/etc/php/${PHP_VERSION}/fpm/pool.d"
    "/etc/php-fpm.d"
    "/usr/local/etc/php-fpm.d"
)
POOL_DIR=""
for d in "${POOL_DIRS[@]}"; do
    [[ -d "$d" ]] && POOL_DIR="$d" && break
done

# ── 2. Find misconfigured pool ────────────────────────────────────────────────
log "Searching for misconfigured open_basedir..."

BAD_POOLS=()
if [[ -n "$POOL_DIR" ]]; then
    while IFS= read -r -d '' conf_file; do
        if grep -q "modaui.com" "$conf_file" 2>/dev/null; then
            BAD_POOLS+=("$conf_file")
            warn "BAD POOL FOUND: $conf_file"
            warn "  Contains modaui.com in open_basedir!"
        fi
    done < <(find "$POOL_DIR" -name "*.conf" -print0 2>/dev/null)
fi

# Also check aaPanel site config (avoid duplicate if already in POOL_DIR)
AAPANEL_EXTRA_DIRS=(
    "/www/server/panel/vhost/php"
)
for d in "${AAPANEL_EXTRA_DIRS[@]}"; do
    [[ -d "$d" ]] || continue
    while IFS= read -r -d '' conf_file; do
        if grep -q "modaui.com" "$conf_file" 2>/dev/null; then
            # Only add if not already in BAD_POOLS
            already=false
            for p in "${BAD_POOLS[@]:-}"; do [[ "$p" == "$conf_file" ]] && already=true && break; done
            $already || { BAD_POOLS+=("$conf_file"); warn "BAD AAPANEL POOL: $conf_file"; }
        fi
    done < <(find "$d" -name "*.conf" -print0 2>/dev/null)
done

# ── 3. Fix each bad pool ──────────────────────────────────────────────────────
if [[ ${#BAD_POOLS[@]} -eq 0 ]]; then
    warn "No pools with modaui.com found via file search."
    warn "Checking via php -i..."
    CURRENT_OBD=$(php -i 2>/dev/null | grep open_basedir | awk -F'=>' '{print $NF}' | xargs || echo "")
    if echo "$CURRENT_OBD" | grep -q "modaui"; then
        warn "open_basedir is still set to: $CURRENT_OBD"
        warn "This may be set in the aaPanel web GUI."
        warn "Manual fix required — see instructions below."
    fi
else
    for pool_file in "${BAD_POOLS[@]}"; do
        log "Fixing: $pool_file"
        cp -f "$pool_file" "${pool_file}.bak.$(date +%Y%m%d%H%M%S)"

        # Replace the bad open_basedir line
        sed -i \
            "s|php_admin_value\[open_basedir\].*modaui.*|php_admin_value[open_basedir] = ${DEPLOY_PATH}/:/tmp/:/www/php_session/${SITE_DOMAIN}/|g" \
            "$pool_file"

        # Replace session path if it points to modaui
        sed -i \
            "s|php_admin_value\[session.save_path\].*modaui.*|php_admin_value[session.save_path] = /www/php_session/${SITE_DOMAIN}/|g" \
            "$pool_file"

        ok "Fixed: $pool_file"
    done
fi

# ── 4. Create/ensure correct pool config ─────────────────────────────────────
SESSION_DIR="/www/php_session/${SITE_DOMAIN}"
mkdir -p "$SESSION_DIR"
chown -R "${SITE_USER}:${SITE_USER}" "$SESSION_DIR" 2>/dev/null || true

# Use a site-dedicated socket so deepay.srl does NOT share modaui.com's socket.
# The dedicated socket name avoids the open_basedir collision entirely.
DEEPAY_SOCK="/tmp/php-cgi-deepay.sock"

if [[ -n "$POOL_DIR" ]]; then
    CORRECT_POOL="${POOL_DIR}/${SITE_DOMAIN}.conf"
    log "Writing correct pool config to $CORRECT_POOL..."
    cat > "$CORRECT_POOL" <<POOLEOF
; PHP-FPM pool for ${SITE_DOMAIN}
; Fixed by deploy/fix-server.sh on $(date)
; Uses a dedicated socket — does NOT share /tmp/php-cgi-${PHP_MAJOR_MINOR}.sock
; with other sites (e.g. modaui.com) to avoid open_basedir cross-contamination.
[${SITE_DOMAIN}]
user  = ${SITE_USER}
group = ${SITE_USER}

listen = ${DEEPAY_SOCK}
listen.owner = ${SITE_USER}
listen.group = ${SITE_USER}
listen.mode  = 0660

pm                   = dynamic
pm.max_children      = 20
pm.start_servers     = 5
pm.min_spare_servers = 3
pm.max_spare_servers = 8
pm.max_requests      = 500

; CORRECTED: open_basedir now points to THIS site only
php_admin_value[open_basedir]       = ${DEPLOY_PATH}/:/tmp/:/www/php_session/${SITE_DOMAIN}/
php_admin_value[session.save_path]  = ${SESSION_DIR}/
php_admin_value[upload_tmp_dir]     = /tmp/
php_admin_flag[display_errors]      = off
php_admin_value[error_log]          = /www/wwwlogs/${SITE_DOMAIN}.php.error.log
php_admin_value[memory_limit]       = 256M
php_admin_value[max_execution_time] = 120
php_admin_value[post_max_size]      = 64M
php_admin_value[upload_max_filesize]= 32M
POOLEOF
    ok "Pool config written (socket: ${DEEPAY_SOCK})."
fi

# ── 5. Patch nginx to use the dedicated socket ────────────────────────────────
# aaPanel's enable-php-83.conf uses the shared /tmp/php-cgi-83.sock (modaui.com's
# pool). We inject a site-level override in the aaPanel extension directory so that
# requests to www.deepay.srl go to the dedicated deepay pool socket instead.
NGINX_EXT_DIR="/www/server/panel/vhost/nginx/extension/${SITE_DOMAIN}"
mkdir -p "$NGINX_EXT_DIR"
NGINX_PHP_OVERRIDE="${NGINX_EXT_DIR}/php-pool-override.conf"
log "Writing nginx PHP socket override → $NGINX_PHP_OVERRIDE..."
cat > "$NGINX_PHP_OVERRIDE" <<NGINXEOF
# Override the default enable-php-83.conf socket for ${SITE_DOMAIN}.
# This routes PHP requests to the dedicated pool that has the correct open_basedir.
location ~ [^/]\.php(/|\$) {
    try_files \$uri =404;
    fastcgi_pass  unix:${DEEPAY_SOCK};
    fastcgi_index index.php;
    include       fastcgi.conf;
    include       pathinfo.conf;
    fastcgi_read_timeout 120;
}
NGINXEOF
ok "Nginx PHP socket override written."

# ── 6. Write Laravel rewrite rule (fixes 404 for all non-static routes) ──────
# aaPanel stores per-site rewrite rules in this file. Without the try_files line,
# every request that is not a real file returns nginx 404.
log "Writing Laravel rewrite rule → $AAPANEL_REWRITE_CONF..."
mkdir -p "$AAPANEL_REWRITE_DIR"

# Back up existing file if present
[[ -f "$AAPANEL_REWRITE_CONF" ]] && \
    cp -f "$AAPANEL_REWRITE_CONF" "${AAPANEL_REWRITE_CONF}.bak.$(date +%Y%m%d%H%M%S)"

cat > "$AAPANEL_REWRITE_CONF" <<'REWRITEEOF'
# Laravel / React SPA URL rewriting for www.deepay.srl
# Generated by deploy/fix-server.sh

# Serve pre-built React bundle as static files (correct MIME, long cache)
location /dist/ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header X-Content-Type-Options "nosniff";
}

# Serve Laravel template assets as static files
location /assets/ {
    try_files $uri =404;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    add_header X-Content-Type-Options "nosniff";
}

# PWA files — no caching so updates are instant
location = /sw.js {
    try_files $uri =404;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Service-Worker-Allowed "/";
}
location = /manifest.json {
    try_files $uri =404;
    add_header Cache-Control "no-cache";
}

# Laravel front-controller: every other request goes through index.php
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
REWRITEEOF
ok "Laravel rewrite conf written."

# ── 7. Test and reload nginx ──────────────────────────────────────────────────
log "Testing nginx config..."
if nginx -t 2>/dev/null; then
    systemctl reload nginx && ok "Nginx reloaded." || warn "Nginx reload failed — check config."
else
    warn "Nginx config test FAILED — not reloading. Fix the config manually."
    nginx -t
fi

# ── 6. Verify fix ─────────────────────────────────────────────────────────────
log "Verifying fix..."
NEW_OBD=$(php -i 2>/dev/null | grep open_basedir | awk -F'=>' '{print $NF}' | xargs || echo "unknown")
if echo "$NEW_OBD" | grep -q "modaui"; then
    warn "open_basedir still shows modaui.com: $NEW_OBD"
    warn ""
    warn "========================================================="
    warn " MANUAL FIX REQUIRED (aaPanel GUI)"
    warn "========================================================="
    warn " 1. Log in to aaPanel (宝塔面板)"
    warn " 2. Go to: 网站 (Website) → www.deepay.srl → 设置 (Settings)"
    warn " 3. Find: PHP版本 or 目录 (Directory/防跨站)"
    warn " 4. Change open_basedir to:"
    warn "    ${DEPLOY_PATH}/:/tmp/:/www/php_session/${SITE_DOMAIN}/"
    warn " 5. Click Save and restart PHP-FPM"
    warn "========================================================="
else
    ok "open_basedir is now: $NEW_OBD"
fi

# ── 7. Quick smoke test ────────────────────────────────────────────────────────
log "Testing site accessibility..."
HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
    --connect-timeout 5 --max-time 10 \
    "https://${SITE_DOMAIN}/" 2>/dev/null || echo "000")

if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "302" ]]; then
    ok "Site is responding: HTTP $HTTP_CODE ✓"
elif [[ "$HTTP_CODE" == "000" ]]; then
    warn "Could not connect to site (DNS/network may not resolve from server)."
else
    warn "Site returned HTTP $HTTP_CODE — check application logs."
fi

echo ""
ok "========================================================="
ok " Fix script complete."
ok " If still broken, run: sudo bash deploy/setup.sh"
ok "========================================================="
