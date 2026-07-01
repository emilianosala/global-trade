#!/usr/bin/env bash
set -euo pipefail

# ✅ Log por usuario (no /tmp global)
exec >> "$HOME/deploy-globaltrade.log" 2>&1

echo "=== POSTDEPLOY START ==="
echo "Date: $(date -Is)"
echo "User: $(whoami)"
echo "PWD:  $(pwd)"
echo "ENV_FILE: ${ENV_FILE:-NO DEFINIDA}"
echo "========================"

# ✅ PM2 aislado por usuario
export PM2_HOME="$HOME/.pm2"
mkdir -p "$PM2_HOME"

# ✅ NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# ✅ PROD estable = igual que tu local (Node 20.x)
NODE_VERSION="20"

# Instala si falta y úsalo
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"

# ✅ asegurar PATH de binarios globales de npm (pm2, etc.)
export PATH="$(npm prefix -g)/bin:$PATH"

echo "Node: $(node -v)"
echo "NPM : $(npm -v)"

# 🔐 Linkear env persistente si se definió
if [ -n "${ENV_FILE:-}" ] && [ -f "$ENV_FILE" ]; then
  echo "🧩 Linkeando env desde: $ENV_FILE"
  ln -sf "$ENV_FILE" .env.production
else
  echo "⚠️ ENV_FILE no definido o no existe. (build puede fallar si faltan env vars)"
fi

echo "🔧 Instalando PM2 si hace falta..."
command -v pm2 >/dev/null 2>&1 || npm install -g pm2

echo "📦 Instalando dependencias (lockfile)..."
# ✅ determinista, respeta package-lock. NO usar --omit=dev: `next build`
# necesita typescript y @types/* (devDependencies) para compilar el proyecto.
npm ci --silent

echo "🔨 Build..."
npm run build

echo "🚀 Start/Reload con PM2..."
pm2 startOrReload ecosystem.config.js --env production

echo "✅ POSTDEPLOY OK"
echo "========================"