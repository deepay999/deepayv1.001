#!/usr/bin/env bash
# =============================================================================
# deploy/setup.sh — DeePay one-time server setup script
# Run once as root (or sudo user) on a fresh Ubuntu/Debian or CentOS server.
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[SETUP] $*${NC}"; }
ok()   { echo -e "${GREEN}[OK]   $*${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $*${NC}"; }
fail() { echo -e "${RED}[FAIL] $*${NC}" >&2; exit 1; }
hr()   { echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# ── Configuration ─────────────────────────────────────────────────────────────
SITE_USER="${SITE_USER:-www}"
SITE_DOMAIN="${SITE_DOMAIN:-www.deepay.srl}"
DEPLOY_PATH="${DEPLOY_PATH:-/www/wwwroot/${SITE_DOMAIN}}"
REPO_URL="${REPO_URL:-https://github.com/deepay999/deepayv1.001.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"
PHP_VERSION="${PHP_VERSION:-8.4}"
PHP_MAJOR_MINOR="${PHP_VERSION//./}"
# PHP_BIN resolved after OS detection (aaPanel vs system)
PHP_BIN=""
COMPOSER_URL="https://getcomposer.org/installer"

hr
log "DeePay Server Setup"
log "Domain:      $SITE_DOMAIN"
log "Deploy path: $DEPLOY_PATH"
log "PHP version: $PHP_VERSION"
hr

# ── 1. Detect OS ──────────────────────────────────────────────────────────────
if command -v apt-get &>/dev/null; then
  PKG_MGR="apt"
elif command -v dnf &>/dev/null || command -v yum &>/dev/null; then
  PKG_MGR="yum"
else
  warn "Unknown package manager — skipping automatic package installation."
  PKG_MGR="unknown"
fi
DNF_BIN="$(command -v dnf 2>/dev/null || echo yum)"

# ── 2. Detect PHP binary (aaPanel / Remi / system) ───────────────────────────
detect_php_bin() {
  local candidates=(
    "/www/server/php/${PHP_MAJOR_MINOR}/bin/php"
    "/opt/remi/php${PHP_MAJOR_MINOR}/root/usr/bin/php"
    "php${PHP_MAJOR_MINOR}"
    "php${PHP_VERSION}"
    "php"
  )
  for bin in "${candidates[@]}"; do
    if command -v "$bin" &>/dev/null || [[ -x "$bin" ]]; then
      local ver
      ver=$("$bin" -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || echo "")
      if [[ "$ver" == "$PHP_VERSION" ]]; then
        echo "$bin"; return 0
      fi
    fi
  done
  for bin in "${candidates[@]}"; do
    { command -v "$bin" &>/dev/null || [[ -x "$bin" ]]; } && { echo "$bin"; return 0; }
  done
  echo "php"
}

# ── 3. Install system packages ────────────────────────────────────────────────
if [[ "$PKG_MGR" == "apt" ]]; then
  log "Updating package lists..."
  apt-get update -qq

  log "Installing required PHP ${PHP_VERSION} extensions..."
  PACKAGES=(
    "php${PHP_VERSION}" "php${PHP_VERSION}-fpm" "php${PHP_VERSION}-cli"
    "php${PHP_VERSION}-common" "php${PHP_VERSION}-mysql" "php${PHP_VERSION}-pdo"
    "php${PHP_VERSION}-mbstring" "php${PHP_VERSION}-xml" "php${PHP_VERSION}-curl"
    "php${PHP_VERSION}-zip" "php${PHP_VERSION}-gd" "php${PHP_VERSION}-intl"
    "php${PHP_VERSION}-bcmath" "php${PHP_VERSION}-tokenizer" "php${PHP_VERSION}-fileinfo"
    "php${PHP_VERSION}-gmp"
    git curl unzip nginx
  )
  for pkg in "${PACKAGES[@]}"; do
    apt-get install -y "$pkg" 2>/dev/null && ok "Installed $pkg" || warn "Could not install $pkg — may need manual install."
  done

elif [[ "$PKG_MGR" == "yum" ]]; then
  AAPANEL_PHP="/www/server/php/${PHP_MAJOR_MINOR}/bin/php"

  if [[ -x "$AAPANEL_PHP" ]]; then
    ok "aaPanel PHP ${PHP_VERSION} detected: $AAPANEL_PHP — skipping yum PHP install."
    PHP_BIN="$AAPANEL_PHP"
  else
    log "Detected RHEL/CentOS — installing PHP ${PHP_VERSION} via Remi repository..."

    # EPEL
    if ! rpm -q epel-release &>/dev/null; then
      log "Installing EPEL..."
      "$DNF_BIN" install -y epel-release 2>/dev/null || warn "EPEL install failed."
    fi

    # Remi repo
    if ! rpm -q remi-release &>/dev/null; then
      log "Installing Remi repository..."
      OS_MAJOR=$(rpm -E '%{rhel}' 2>/dev/null || echo "9")
      "$DNF_BIN" install -y "https://rpms.remirepo.net/enterprise/remi-release-${OS_MAJOR}.rpm" 2>/dev/null \
        || warn "Could not install Remi repo — PHP packages may fail."
    fi

    # Remi PHP 8.x packages: php84-php-fpm, php84-php-gmp, etc.
    PHP_PKG="php${PHP_MAJOR_MINOR}"
    PHP_EXTS=(
      "${PHP_PKG}-php" "${PHP_PKG}-php-fpm" "${PHP_PKG}-php-cli"
      "${PHP_PKG}-php-mysqlnd" "${PHP_PKG}-php-mbstring" "${PHP_PKG}-php-xml"
      "${PHP_PKG}-php-curl" "${PHP_PKG}-php-zip" "${PHP_PKG}-php-gd"
      "${PHP_PKG}-php-intl" "${PHP_PKG}-php-bcmath" "${PHP_PKG}-php-gmp"
      "${PHP_PKG}-php-opcache" "${PHP_PKG}-php-sodium"
    )
    "$DNF_BIN" install -y "${PHP_EXTS[@]}" 2>/dev/null \
      && ok "PHP ${PHP_VERSION} (Remi) installed." \
      || warn "Some PHP packages failed — ensure Remi repo is enabled."
  fi

  # Base tools
  for pkg in git curl unzip; do
    rpm -q "$pkg" &>/dev/null || "$DNF_BIN" install -y "$pkg" 2>/dev/null || warn "Could not install $pkg"
  done

  # nginx — use --disableexcludes in case it is filtered in yum.conf
  if ! command -v nginx &>/dev/null; then
    "$DNF_BIN" install -y nginx --disableexcludes=all 2>/dev/null \
      || "$DNF_BIN" install -y nginx --skip-broken 2>/dev/null \
      || warn "Could not install nginx — install it manually or via aaPanel."
  else
    ok "nginx already installed."
  fi
fi

# ── Resolve PHP_BIN now that packages are installed ──────────────────────────
[[ -z "$PHP_BIN" ]] && PHP_BIN="$(detect_php_bin)"
ok "Using PHP binary: $PHP_BIN ($("$PHP_BIN" -r 'echo phpversion();' 2>/dev/null || echo 'unknown version'))"

# ── 3. Install Composer ───────────────────────────────────────────────────────
log "Checking Composer..."
if ! command -v composer &>/dev/null; then
  log "Installing Composer..."
  curl -sS "$COMPOSER_URL" | "$PHP_BIN" -- --install-dir=/usr/local/bin --filename=composer \
    && ok "Composer installed." \
    || fail "Composer installation failed."
else
  ok "Composer already installed: $(composer --version 2>/dev/null | head -1)"
fi

# ── 4. Clone or validate repository ──────────────────────────────────────────
log "Checking repository at $DEPLOY_PATH..."
mkdir -p "$(dirname "$DEPLOY_PATH")"

if [[ -d "$DEPLOY_PATH/.git" ]]; then
  ok "Repository already exists — fetching latest code."
  cd "$DEPLOY_PATH"
  git fetch origin "$GIT_BRANCH"
  git reset --hard "origin/${GIT_BRANCH}"
else
  log "Cloning repository..."
  git clone --branch "$GIT_BRANCH" "$REPO_URL" "$DEPLOY_PATH" \
    || fail "Git clone failed."
  ok "Repository cloned."
fi
cd "$DEPLOY_PATH"

# ── 5. Configure PHP-FPM pool (fix open_basedir) ─────────────────────────────
log "Configuring PHP-FPM pool for $SITE_DOMAIN..."

# Detect pool.d directory — aaPanel stores pools under /www/server/php/XX/etc/php-fpm.d/
POOL_DIR_CANDIDATES=(
  "/www/server/php/${PHP_MAJOR_MINOR}/etc/php-fpm.d"   # aaPanel / BT Panel
  "/etc/php/${PHP_VERSION}/fpm/pool.d"                  # Debian/Ubuntu
  "/etc/php-fpm.d"                                      # RHEL/CentOS system
  "/usr/local/etc/php-fpm.d"                            # Homebrew / custom
)
POOL_CONF_DIR=""
for d in "${POOL_DIR_CANDIDATES[@]}"; do
  if [[ -d "$d" ]]; then POOL_CONF_DIR="$d"; break; fi
done
if [[ -z "$POOL_CONF_DIR" ]]; then
  warn "Could not find PHP-FPM pool.d directory — skipping pool config."
else
  POOL_CONF="${POOL_CONF_DIR}/${SITE_DOMAIN}.conf"
fi

# Socket path — aaPanel uses /tmp/php-cgi-XX.sock
SOCK_PATH="/tmp/php-cgi-${PHP_MAJOR_MINOR}.sock"

if [[ -n "$POOL_CONF_DIR" ]]; then
  cat > "$POOL_CONF" <<EOF
; PHP-FPM pool for ${SITE_DOMAIN}
; Generated by deploy/setup.sh — DO NOT manually mix with other sites.
[${SITE_DOMAIN}]
user  = ${SITE_USER}
group = ${SITE_USER}

listen = ${SOCK_PATH}
listen.owner = ${SITE_USER}
listen.group = ${SITE_USER}
listen.mode  = 0660

pm                   = dynamic
pm.max_children      = 20
pm.start_servers     = 5
pm.min_spare_servers = 3
pm.max_spare_servers = 8
pm.max_requests      = 500

; CRITICAL: open_basedir must include THIS site's path only.
; The prior misconfiguration pointed to modaui.com — this is now corrected.
php_admin_value[open_basedir]  = ${DEPLOY_PATH}/:/tmp/:/www/php_session/${SITE_DOMAIN}/
php_admin_value[session.save_path] = /www/php_session/${SITE_DOMAIN}/
php_admin_value[upload_tmp_dir]    = /tmp/
php_admin_flag[display_errors]     = off
php_admin_value[error_log]         = /www/wwwlogs/${SITE_DOMAIN}.error.log
php_admin_value[memory_limit]      = 256M
php_admin_value[max_execution_time] = 120
php_admin_value[post_max_size]     = 64M
php_admin_value[upload_max_filesize] = 32M
php_flag[expose_php]               = off
EOF
  ok "PHP-FPM pool config written: $POOL_CONF"
else
  warn "Skipped writing PHP-FPM pool config (pool.d directory not found)."
fi

# Create session directory
SESSION_DIR="/www/php_session/${SITE_DOMAIN}"
mkdir -p "$SESSION_DIR"
chown -R "$SITE_USER:$SITE_USER" "$SESSION_DIR" 2>/dev/null || true
ok "Session directory: $SESSION_DIR"

# Reload PHP-FPM — try aaPanel service names first, then standard names
for svc in "php${PHP_MAJOR_MINOR}" "php${PHP_MAJOR_MINOR}-fpm" "php${PHP_VERSION}-fpm" "php-fpm83" "php-fpm84" "php-fpm"; do
  if systemctl is-active --quiet "$svc" 2>/dev/null; then
    systemctl reload "$svc" && ok "Reloaded $svc" && break
  elif systemctl is-enabled --quiet "$svc" 2>/dev/null; then
    systemctl restart "$svc" && ok "Restarted $svc" && break
  fi
done

# ── 6. Write nginx vhost ──────────────────────────────────────────────────────
log "Writing nginx vhost for $SITE_DOMAIN..."
NGINX_CONF_DIR="/etc/nginx/conf.d"
[[ -d /etc/nginx/sites-available ]] && NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_CONF="${NGINX_CONF_DIR}/${SITE_DOMAIN}.conf"

cat > "$NGINX_CONF" <<'NGINXEOF'
# Nginx vhost for www.deepay.srl
# Generated by deploy/setup.sh
server {
    listen 80;
    listen [::]:80;
    server_name deepay.srl www.deepay.srl;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name deepay.srl www.deepay.srl;

    root ${DEPLOY_PATH};
    index index.php index.html;

    # TLS — replace with your cert paths (Let's Encrypt / aaPanel auto-SSL)
    ssl_certificate     /etc/ssl/certs/deepay.srl.pem;
    ssl_certificate_key /etc/ssl/private/deepay.srl.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Charset — prevents garbled text (乱码)
    charset utf-8;
    source_charset utf-8;

    # Static assets (served directly, with long cache)
    location ~* ^/(assets|dist|images|fonts|css|js)/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # manifest.json and sw.js at root
    location ~ ^/(manifest\.json|sw\.js)$ {
        try_files $uri =404;
        add_header Cache-Control "no-cache";
    }

    # Rewrite all other requests to Laravel's index.php
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP via FastCGI — uses the CORRECT pool socket for this site
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass  unix:${SOCK_PATH};
        fastcgi_index index.php;
        include       fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO       $fastcgi_path_info;

        # Security headers
        fastcgi_param  HTTP_X_FORWARDED_PROTO $scheme;
        fastcgi_read_timeout 120;
    }

    # Deny hidden files
    location ~ /\. { deny all; }

    # Deny access to sensitive files
    location ~* \.(env|log|bak|sql|zip|git)$ { deny all; }

    access_log /www/wwwlogs/www.deepay.srl.access.log;
    error_log  /www/wwwlogs/www.deepay.srl.error.log;
}
NGINXEOF

ok "Nginx config written: $NGINX_CONF"
[[ -d /etc/nginx/sites-enabled ]] && \
  ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${SITE_DOMAIN}.conf" 2>/dev/null || true

nginx -t && systemctl reload nginx && ok "Nginx reloaded." || warn "Nginx reload failed — check config."

# ── 7. Prepare Laravel environment ───────────────────────────────────────────
log "Setting up Laravel .env..."
CORE="$DEPLOY_PATH/core"
if [[ ! -f "$CORE/.env" ]]; then
  if [[ -f "$CORE/.env.example" ]]; then
    cp "$CORE/.env.example" "$CORE/.env"
    ok ".env copied from .env.example."
    warn "IMPORTANT: Edit $CORE/.env and set your DB credentials, APP_URL, etc."
  else
    warn ".env.example not found — create $CORE/.env manually."
  fi
else
  ok ".env already exists."
fi

# ── 8. Composer install ───────────────────────────────────────────────────────
log "Installing PHP dependencies..."
cd "$CORE"
if ! "$PHP_BIN" "$(command -v composer)" install --no-dev --optimize-autoloader --no-interaction 2>/dev/null; then
  warn "Composer failed with platform checks — retrying with --ignore-platform-reqs"
  "$PHP_BIN" "$(command -v composer)" install --no-dev --optimize-autoloader --no-interaction \
    --ignore-platform-reqs
fi
ok "Composer install complete."

# ── 9. Generate app key ───────────────────────────────────────────────────────
KEY_LINE=$(grep "^APP_KEY=" "$CORE/.env" 2>/dev/null || echo "")
if [[ -z "$KEY_LINE" || "$KEY_LINE" == "APP_KEY=" ]]; then
  log "Generating application key..."
  cd "$DEPLOY_PATH"
  "$PHP_BIN" index.php artisan key:generate --force && ok "App key generated."
else
  ok "App key already set."
fi

# ── 10. Fix permissions ───────────────────────────────────────────────────────
log "Fixing file permissions..."
chown -R "${SITE_USER}:${SITE_USER}" "$DEPLOY_PATH" 2>/dev/null || true
chmod -R 775 "$CORE/storage" "$CORE/bootstrap/cache" 2>/dev/null || true
ok "Permissions set."

# ── 11. Migrations ────────────────────────────────────────────────────────────
log "Running database migrations..."
cd "$DEPLOY_PATH"
"$PHP_BIN" index.php artisan migrate --force --no-interaction \
  && ok "Migrations complete." \
  || warn "Migrations failed — check DB config in .env."

# ── 12. Cache warm-up ─────────────────────────────────────────────────────────
log "Warming up caches..."
cd "$DEPLOY_PATH"
"$PHP_BIN" index.php artisan config:cache 2>/dev/null && ok "Config cached."  || warn "config:cache failed"
"$PHP_BIN" index.php artisan route:cache  2>/dev/null && ok "Routes cached."  || warn "route:cache failed"
"$PHP_BIN" index.php artisan view:cache   2>/dev/null && ok "Views cached."   || warn "view:cache failed"

hr
ok "Setup complete!"
hr
cat <<MSG

Next steps:
  1. Edit ${CORE}/.env and set:
       APP_URL=https://www.deepay.srl
       APP_ENV=production
       DB_DATABASE=your_db
       DB_USERNAME=your_user
       DB_PASSWORD=your_password
  2. If using aaPanel/BT Panel: Go to Website → PHP Settings → Set
       open_basedir to: ${DEPLOY_PATH}/:/tmp/:/www/php_session/${SITE_DOMAIN}/
  3. Ensure SSL certificates are installed at:
       /etc/ssl/certs/deepay.srl.pem
       /etc/ssl/private/deepay.srl.key
  4. Run: bash deploy/deploy.sh  for future deploys.

MSG
