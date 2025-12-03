#!/bin/bash

# DirectConverter 快速部署腳本
# 使用方式: ./quick-deploy.sh YOUR_SERVER_IP [YOUR_DOMAIN]

set -e

if [ -z "$1" ]; then
    echo "使用方式: ./quick-deploy.sh SERVER_IP [DOMAIN]"
    echo "範例: ./quick-deploy.sh 123.45.67.89 converter.example.com"
    exit 1
fi

SERVER_IP=$1
DOMAIN=${2:-$SERVER_IP}
APP_DIR="/opt/directconverter"

echo "=== DirectConverter 快速部署 ==="
echo "伺服器 IP: $SERVER_IP"
echo "域名/IP: $DOMAIN"
echo ""

# 第一步: 上傳代碼到伺服器
echo "步驟 1/6: 上傳代碼到伺服器..."
ssh root@$SERVER_IP "mkdir -p $APP_DIR"
rsync -avz --exclude 'node_modules' --exclude '__pycache__' --exclude '.git' \
    ./ root@$SERVER_IP:$APP_DIR/

# 第二步: 安裝 Docker 和依賴
echo "步驟 2/6: 安裝必要軟體..."
ssh root@$SERVER_IP << 'ENDSSH'
apt-get update
apt-get install -y curl nginx certbot python3-certbot-nginx ufw

# 安裝 Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# 安裝 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi
ENDSSH

# 第三步: 配置環境變數
echo "步驟 3/6: 配置環境變數..."
ssh root@$SERVER_IP << ENDSSH
cd $APP_DIR
cat > .env.production << 'EOF'
VITE_API_URL=http://$DOMAIN/api
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://$DOMAIN,https://$DOMAIN
MAX_UPLOAD_SIZE=52428800
LOG_LEVEL=INFO
EOF
ENDSSH

# 第四步: 配置 Nginx
echo "步驟 4/6: 配置 Nginx..."
ssh root@$SERVER_IP << ENDSSH
cat > /etc/nginx/sites-available/directconverter << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /download {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/directconverter /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
ENDSSH

# 第五步: 啟動應用
echo "步驟 5/6: 啟動 Docker 容器..."
ssh root@$SERVER_IP << ENDSSH
cd $APP_DIR
docker-compose down
docker-compose up -d --build
ENDSSH

# 第六步: 設定防火牆
echo "步驟 6/6: 配置防火牆..."
ssh root@$SERVER_IP << 'ENDSSH'
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
ENDSSH

echo ""
echo "=== 部署完成! ==="
echo ""
echo "您的應用現在可以通過以下網址訪問:"
echo "http://$DOMAIN"
echo ""
echo "下一步 (可選):"
echo "1. 設定 SSL 憑證:"
echo "   ssh root@$SERVER_IP"
echo "   certbot --nginx -d $DOMAIN"
echo ""
echo "2. 查看應用日誌:"
echo "   ssh root@$SERVER_IP"
echo "   cd $APP_DIR && docker-compose logs -f"
echo ""
