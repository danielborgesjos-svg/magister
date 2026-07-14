#!/bin/bash
# ============================================================
# JARVIS 4.1 — Deploy Script: Magister ERP → VPS
# Roda na VPS: bash /var/www/magister/deploy.sh
# ============================================================
set -e

APP_DIR="/var/www/magister"
APP_NAME="magister-erp"
BRANCH="main"

echo "======================================"
echo " MAGISTER ERP — DEPLOY AUTOMÁTICO"
echo "======================================"

echo "[1/6] Atualizando código do GitHub..."
cd $APP_DIR
git pull origin $BRANCH

echo "[2/6] Instalando dependências..."
npm install --omit=dev

echo "[3/6] Gerando Prisma Client..."
npx prisma generate

echo "[4/6] Executando migrações do banco..."
npx prisma migrate deploy

echo "[5/6] Buildando Next.js..."
npm run build

echo "[6/6] Reiniciando PM2..."
pm2 describe $APP_NAME > /dev/null 2>&1 && pm2 restart $APP_NAME || pm2 start ecosystem.config.js
pm2 save

echo "======================================"
echo " DEPLOY CONCLUÍDO COM SUCESSO!"
echo " Acesse: https://erp.magistertech.com.br"
echo "======================================"
