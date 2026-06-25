#!/bin/bash
# KVL Track VPS Deployment Script
# Run on VPS as root: bash deploy.sh

set -e

REPO="https://github.com/kamaralam1984/GRAVITY.git"
APP_DIR="/var/www/gravity"
DOMAIN="kvltrack.kvlbusinesssolutions.com"
EMAIL="8rupiya@gmail.com"

echo "=== KVL Track Deploy ==="

# 1. Clone or update repo
if [ -d "$APP_DIR/.git" ]; then
    echo "[1/5] Pulling latest code..."
    git -C "$APP_DIR" pull origin main
else
    echo "[1/5] Cloning repo..."
    git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

# 2. Build & start Docker containers
echo "[2/5] Building and starting containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 3. Wait for containers
echo "[3/5] Waiting for containers to be healthy..."
sleep 10
docker ps --filter "name=kvltrack"

# 4. Setup Nginx
echo "[4/5] Setting up Nginx..."
cp nginx/kvltrack.kvlbusinesssolutions.com /etc/nginx/sites-available/kvltrack.kvlbusinesssolutions.com
ln -sf /etc/nginx/sites-available/kvltrack.kvlbusinesssolutions.com /etc/nginx/sites-enabled/kvltrack.kvlbusinesssolutions.com
nginx -t && systemctl reload nginx
echo "Nginx configured for $DOMAIN"

# 5. SSL Certificate
echo "[5/5] Getting SSL certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || echo "SSL failed — run manually: certbot --nginx -d $DOMAIN"

echo ""
echo "=== Done! ==="
echo "Site: https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml restart"
