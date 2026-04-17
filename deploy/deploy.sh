#!/usr/bin/env bash
# =============================================================================
# deploy/deploy.sh — DeePay server-side deploy script
# Usage: bash deploy/deploy.sh [--skip-migrate] [--skip-cache]
# =============================================================================
set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[$(date '+%H:%M:%S')] $*${NC}"; }
ok()   { echo -e "${GREEN}[OK]  $*${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $*${NC}"; }
fail() { echo -e "${RED}[FAIL] $*${NC}" >&2; exit 1; }

# ── Configuration (override via environment) ──────────────────────────────────
DEPLOY_PATH="${DEPLOY_PATH:-/www/wwwroot/www.deepay.srl}"
CORE_PATH="${CORE_PATH:-${DEPLOY_PATH}/core}"
GIT_BRANCH="${GIT_BRANCH:-main}"
PHP_BIN="${PHP_BIN:-php}"
COMPOSER_BIN="${COMPOSER_BIN:-composer}"

SKIP_MIGRATE=false
SKIP_CACHE=false
for arg in "$@"; do
  [[ "$arg" == "--skip-migrate" ]] && SKIP_MIGRATE=true
  [[ "$arg" == "--skip-cache"   ]] && SKIP_CACHE=true
done

# ── 1. Check required commands ────────────────────────────────────────────────
log "Checking required commands..."
for cmd in git "$PHP_BIN" "$COMPOSER_BIN" rsync; do
  if ! command -v "$cmd" &>/dev/null; then
    fail "Required command not found: $cmd"
  fi
done
ok "All required commands present."

# ── 2. Verify deploy path ─────────────────────────────────────────────────────
log "Verifying deploy path: $DEPLOY_PATH"
[[ -d "$DEPLOY_PATH" ]]   || fail "Deploy path does not exist: $DEPLOY_PATH"
[[ -d "$DEPLOY_PATH/.git" ]] || fail "Not a git repository: $DEPLOY_PATH"
[[ -d "$CORE_PATH" ]]     || fail "Laravel core not found: $CORE_PATH"
ok "Deploy path OK."

# ── 3. Check PHP required extensions ─────────────────────────────────────────
log "Checking PHP extensions..."
MISSING_EXTS=()
for ext in fileinfo gmp mbstring openssl pdo curl xml zip; do
  if ! "$PHP_BIN" -m 2>/dev/null | grep -qi "^${ext}$"; then
    MISSING_EXTS+=("$ext")
  fi
done

if [[ ${#MISSING_EXTS[@]} -gt 0 ]]; then
  warn "Missing PHP extensions: ${MISSING_EXTS[*]}"
  warn "Attempting to install missing extensions..."
  PHP_VERSION=$("$PHP_BIN" -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || echo "")
  if command -v apt-get &>/dev/null && [[ -n "$PHP_VERSION" ]]; then
    for ext in "${MISSING_EXTS[@]}"; do
      sudo apt-get install -y "php${PHP_VERSION}-${ext}" 2>/dev/null \
        || sudo apt-get install -y "php-${ext}" 2>/dev/null \
        || warn "Could not auto-install php-${ext} — install it manually."
    done
  elif command -v yum &>/dev/null && [[ -n "$PHP_VERSION" ]]; then
    for ext in "${MISSING_EXTS[@]}"; do
      sudo yum install -y "php${PHP_VERSION/./}-${ext}" 2>/dev/null \
        || warn "Could not auto-install php-${ext} — install it manually."
    done
  else
    warn "Cannot auto-install extensions. Please run: sudo apt-get install php-fileinfo php-gmp"
  fi
else
  ok "All required PHP extensions present."
fi

# ── 4. Fix open_basedir if misconfigured ─────────────────────────────────────
log "Checking open_basedir configuration..."
OPENBASEDIR=$("$PHP_BIN" -i 2>/dev/null | grep "open_basedir" | awk -F'=>' '{print $2}' | xargs || echo "")
if [[ -n "$OPENBASEDIR" && "$OPENBASEDIR" != "no value" ]]; then
  if ! echo "$OPENBASEDIR" | grep -q "$DEPLOY_PATH"; then
    warn "open_basedir is set to: $OPENBASEDIR"
    warn "It does NOT include $DEPLOY_PATH — this will cause 'Operation not permitted' errors!"
    warn "Run: sudo bash deploy/fix-server.sh  to correct the PHP-FPM pool configuration."
  else
    ok "open_basedir includes deploy path."
  fi
fi

# ── 5. Git: fetch and reset ───────────────────────────────────────────────────
log "Pulling latest code from origin/${GIT_BRANCH}..."
cd "$DEPLOY_PATH"
git fetch --quiet origin "$GIT_BRANCH"
git reset --hard "origin/${GIT_BRANCH}"
git clean -fd --quiet
ok "Code updated to $(git rev-parse --short HEAD)."

# ── 6. Fix directory permissions ─────────────────────────────────────────────
log "Fixing writable directory permissions..."
for dir in storage bootstrap/cache; do
  TARGET="${CORE_PATH}/${dir}"
  if [[ -d "$TARGET" ]]; then
    chmod -R 775 "$TARGET" 2>/dev/null || warn "Could not chmod $TARGET"
    ok "$dir permissions OK."
  else
    warn "$TARGET not found — skipping."
  fi
done

# ── 7. Composer install ───────────────────────────────────────────────────────
log "Running composer install..."
cd "$CORE_PATH"

# Check if vendor is missing entirely — remediate
if [[ ! -d vendor ]]; then
  warn "vendor/ directory missing — running fresh install."
fi

# Try with platform requirements first; fall back to --ignore-platform-reqs
if ! "$COMPOSER_BIN" install --no-dev --optimize-autoloader --no-interaction --quiet 2>/dev/null; then
  warn "Composer install failed with platform checks — retrying with --ignore-platform-reqs"
  "$COMPOSER_BIN" install --no-dev --optimize-autoloader --no-interaction --quiet \
    --ignore-platform-reqs \
    || fail "Composer install failed even with --ignore-platform-reqs."
fi
ok "Composer install complete."

# ── 8. Database migrations ────────────────────────────────────────────────────
if [[ "$SKIP_MIGRATE" == "false" ]]; then
  log "Running database migrations..."
  cd "$CORE_PATH"
  "$PHP_BIN" artisan migrate --force --no-interaction \
    || fail "Migration failed."
  ok "Migrations complete."
else
  warn "Skipping migrations (--skip-migrate)."
fi

# ── 9. Storage symlink (required for uploaded images) ─────────────────────────
log "Creating storage symlink..."
cd "$CORE_PATH"
"$PHP_BIN" artisan storage:link --force 2>/dev/null \
  && ok "Storage symlink created/verified." \
  || warn "storage:link failed — uploaded images may not display."

# ── 10. Clear and rebuild caches ──────────────────────────────────────────────
if [[ "$SKIP_CACHE" == "false" ]]; then
  log "Rebuilding caches..."
  cd "$CORE_PATH"
  "$PHP_BIN" artisan config:clear   2>/dev/null || warn "config:clear failed"
  "$PHP_BIN" artisan route:clear    2>/dev/null || warn "route:clear failed"
  "$PHP_BIN" artisan view:clear     2>/dev/null || warn "view:clear failed"
  "$PHP_BIN" artisan event:clear    2>/dev/null || warn "event:clear failed"
  "$PHP_BIN" artisan config:cache   2>/dev/null || warn "config:cache failed"
  "$PHP_BIN" artisan route:cache    2>/dev/null || warn "route:cache failed"
  "$PHP_BIN" artisan view:cache     2>/dev/null || warn "view:cache failed"
  ok "Cache rebuild complete."
else
  warn "Skipping cache rebuild (--skip-cache)."
fi

# ── 11. Reload PHP-FPM ───────────────────────────────────────────────────────
log "Reloading PHP-FPM..."
for svc in php8.3-fpm php8.2-fpm php8.1-fpm php-fpm php83 php82; do
  if systemctl is-active --quiet "$svc" 2>/dev/null; then
    sudo systemctl reload "$svc" && ok "Reloaded $svc." && break
  fi
done

# ── 12. Done ──────────────────────────────────────────────────────────────────
echo ""
ok "============================================================="
ok " Deploy complete: $(git -C "$DEPLOY_PATH" log -1 --oneline)"
ok "============================================================="
