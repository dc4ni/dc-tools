#!/bin/bash

# DirectConverter 完全自動化部署腳本
# 此腳本會完成所有部署步驟

SERVER_IP="172.238.14.142"
SERVER_USER="root"
SERVER_PASSWORD="@Joendle396"
APP_DIR="/opt/directconverter"

echo "================================================"
echo "DirectConverter 自動化部署到 Linode"
echo "================================================"
echo ""
echo "目標伺服器: $SERVER_IP"
echo "應用目錄: $APP_DIR"
echo ""
echo "此腳本將自動完成以下步驟:"
echo "1. 上傳代碼到伺服器"
echo "2. 安裝 Docker 和 Nginx"
echo "3. 配置應用"
echo "4. 啟動服務"
echo ""
read -p "按 Enter 繼續,或 Ctrl+C 取消..." 

# 檢查 sshpass 是否安裝 (用於自動輸入密碼)
if ! command -v sshpass &> /dev/null; then
    echo ""
    echo "正在安裝 sshpass (用於自動認證)..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install hudochenkov/sshpass/sshpass
        else
            echo "錯誤: 需要安裝 Homebrew"
            echo "請手動執行部署或安裝 Homebrew: https://brew.sh"
            exit 1
        fi
    else
        # Linux
        sudo apt-get install -y sshpass
    fi
fi

# 步驟 1: 上傳代碼
echo ""
echo "========================================="
echo "步驟 1/4: 上傳代碼到伺服器"
echo "========================================="
echo ""

# 創建應用目錄
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR"

# 上傳代碼
sshpass -p "$SERVER_PASSWORD" rsync -avz --progress \
    -e "ssh -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '__pycache__' \
    --exclude '.git' \
    --exclude 'backend/uploads/*' \
    --exclude 'backend/temp/*' \
    --exclude 'backend/logs/*' \
    --exclude 'frontend/dist' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

echo ""
echo "✅ 代碼上傳完成"

# 步驟 2: 安裝環境
echo ""
echo "========================================="
echo "步驟 2/4: 安裝必要軟體"
echo "========================================="
echo ""

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

echo "更新系統..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo ""
echo "安裝基本工具..."
apt-get install -y curl wget git vim

echo ""
echo "安裝 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker 安裝完成"
else
    echo "✅ Docker 已安裝,跳過"
fi

echo ""
echo "安裝 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安裝完成"
else
    echo "✅ Docker Compose 已安裝,跳過"
fi

echo ""
echo "安裝 Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    echo "✅ Nginx 安裝完成"
else
    echo "✅ Nginx 已安裝,跳過"
fi

echo ""
echo "已安裝的軟體版本:"
docker --version
docker-compose --version
nginx -v 2>&1
ENDSSH

echo ""
echo "✅ 環境安裝完成"

# 步驟 3: 配置應用
echo ""
echo "========================================="
echo "步驟 3/4: 配置應用"
echo "========================================="
echo ""

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

cd /opt/directconverter

echo "創建環境變數檔案..."
cp .env.production .env

echo ""
echo "配置 Nginx..."
cp nginx.conf /etc/nginx/sites-available/directconverter
ln -sf /etc/nginx/sites-available/directconverter /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "測試 Nginx 配置..."
nginx -t

echo "重新載入 Nginx..."
systemctl reload nginx

echo ""
echo "配置防火牆..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable || true

echo ""
echo "✅ 應用配置完成"
ENDSSH

echo ""
echo "✅ 配置完成"

# 步驟 4: 啟動應用
echo ""
echo "========================================="
echo "步驟 4/4: 建置並啟動應用"
echo "========================================="
echo ""

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

cd /opt/directconverter

echo "停止舊容器 (如果存在)..."
docker-compose down 2>/dev/null || true

echo ""
echo "建置並啟動新容器..."
docker-compose up -d --build

echo ""
echo "等待容器啟動..."
sleep 10

echo ""
echo "容器狀態:"
docker-compose ps

echo ""
echo "查看最近的日誌:"
docker-compose logs --tail=20
ENDSSH

# 完成
echo ""
echo "================================================"
echo "🎉 部署完成!"
echo "================================================"
echo ""
echo "訪問網址: http://172.238.14.142"
echo ""
echo "常用命令:"
echo "  查看日誌: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs -f'"
echo "  重啟服務: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose restart'"
echo "  查看狀態: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose ps'"
echo ""
echo "⚠️  安全建議:"
echo "  1. 建議修改 root 密碼或改用 SSH key 登入"
echo "  2. 考慮創建非 root 使用者進行日常管理"
echo ""
