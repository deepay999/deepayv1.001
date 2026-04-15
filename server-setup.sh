#!/bin/bash
# ============================================================
#  DeePay — Server Setup Script
#  Run ONCE on your VPS to prepare it for auto-deployment.
#  Usage: bash server-setup.sh
# ============================================================
set -euo pipefail

DEPLOY_DIR="/var/www/deepayv1.001"
REPO_URL="https://github.com/deepveloce-dot/deepayv1.001.git"
DEPLOY_BRANCH="main"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   DeePay VPS Setup — Auto Deploy     ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Install Node.js 20 (if not present) ─────────────────
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
  echo "📦 Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "✅ Node.js $(node -v) already installed"
fi

# ── 2. Ensure git is installed ──────────────────────────────
apt-get install -y git rsync 2>/dev/null || true

# ── 3. Create deploy dir & clone repo ──────────────────────
if [ ! -d "$DEPLOY_DIR/.git" ]; then
  echo "📥 Cloning repository to $DEPLOY_DIR..."
  git clone --branch "$DEPLOY_BRANCH" "$REPO_URL" "$DEPLOY_DIR"
else
  echo "✅ Repository already cloned at $DEPLOY_DIR"
fi

# ── 4. Install npm deps & initial build ────────────────────
cd "$DEPLOY_DIR"
echo "📦 Installing npm dependencies..."
npm ci
echo "🔨 Running initial build..."
npm run build
echo "✅ Build complete — dist/ generated"

# ── 5. sudo rule for PHP-FPM reload (passwordless) ─────────
SUDO_LINE="www-data ALL=(ALL) NOPASSWD: /bin/systemctl reload php8.2-fpm, /bin/systemctl reload php8.1-fpm"
if ! grep -qF "php-fpm" /etc/sudoers 2>/dev/null; then
  echo "$SUDO_LINE" >> /etc/sudoers
  echo "✅ Added passwordless sudo for PHP-FPM reload"
fi

# ── 6. Print GitHub Secrets needed ─────────────────────────
SERVER_IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
echo "══════════════════════════════════════════════════════"
echo "  👇 Add these 4 Secrets in GitHub:"
echo "  Repo → Settings → Secrets → Actions → New secret"
echo "══════════════════════════════════════════════════════"
echo ""
echo "  SSH_HOST  →  $SERVER_IP"
echo "  SSH_USER  →  $(whoami)"
echo "  SSH_PORT  →  22"
echo "  SSH_KEY   →  (paste your private key — see step below)"
echo ""
echo "══════════════════════════════════════════════════════"
echo "  🔑 Generate SSH key pair for GitHub Actions:"
echo "══════════════════════════════════════════════════════"
echo ""
echo "  Run on your LOCAL machine:"
echo "    ssh-keygen -t ed25519 -C 'github-actions-deepay' -f ~/.ssh/deepay_deploy"
echo ""
echo "  Then on this SERVER:"
echo "    echo '<paste_public_key_content>' >> ~/.ssh/authorized_keys"
echo "    chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "  Copy the PRIVATE key (~/.ssh/deepay_deploy) content into GitHub Secret SSH_KEY"
echo ""
echo "✅ Server setup complete!"
echo "   Push to 'main' branch → GitHub Actions will auto-build & deploy."
