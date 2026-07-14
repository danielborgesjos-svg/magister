#!/bin/bash
# JARVIS 4.1 - Nginx Config: magisterIA no IP direto
# Serve: http://187.127.11.172/magisterIA -> localhost:3000

set -e

NGINX_CONF="/etc/nginx/sites-available/magisterIA"
NGINX_LINK="/etc/nginx/sites-enabled/magisterIA"

echo "Configurando Nginx para /magisterIA -> localhost:3000..."

cat > $NGINX_CONF << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Proxy /magisterIA para o Next.js na porta 3000
    location /magisterIA {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static assets do Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativa o site
ln -sf $NGINX_CONF $NGINX_LINK

# Remove o default se existir (evita conflito)
rm -f /etc/nginx/sites-enabled/default

# Testa e recarrega
nginx -t && systemctl reload nginx

echo "==========================="
echo "Nginx OK!"
echo "Acesse: http://187.127.11.172/magisterIA"
echo "==========================="
