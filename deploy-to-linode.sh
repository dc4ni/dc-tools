#!/bin/bash

# 快速部署腳本 - 本機執行
# 此腳本會自動上傳代碼到伺服器並完成部署

SERVER_IP="172.238.14.142"
SERVER_USER="root"
APP_DIR="/opt/directconverter"
LOCAL_DIR="/Users/dc/Desktop/code/DirectConverter"

echo "=================================="
echo "DirectConverter 快速部署到 Linode"
echo "=================================="
echo ""
echo "目標伺服器: $SERVER_IP"
echo "應用目錄: $APP_DIR"
echo ""

# 檢查本機是否在正確目錄
if [ ! -f "docker-compose.yml" ]; then
    echo "錯誤: 請在 DirectConverter 專案根目錄執行此腳本"
    exit 1
fi

# 步驟 1: 上傳代碼
echo "步驟 1/2: 上傳代碼到伺服器..."
echo ""

ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR"

rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '__pycache__' \
    --exclude '.git' \
    --exclude 'backend/uploads/*' \
    --exclude 'backend/temp/*' \
    --exclude 'backend/logs/*' \
    --exclude 'frontend/dist' \
    --exclude 'frontend/node_modules' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

echo ""
echo "✅ 代碼上傳完成"
echo ""

# 步驟 2: 在伺服器上執行部署
echo "步驟 2/2: 在伺服器上部署應用..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt/directconverter

echo "建置並啟動 Docker 容器..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

echo ""
echo "等待容器啟動..."
sleep 5

echo ""
echo "容器狀態:"
docker-compose ps

echo ""
echo "=================================="
echo "部署完成!"
echo "=================================="
echo ""
echo "訪問網址: http://172.238.14.142"
echo ""
echo "查看日誌: docker-compose logs -f"
echo "重啟服務: docker-compose restart"
echo "停止服務: docker-compose down"
echo ""
ENDSSH

echo ""
echo "🎉 部署成功!"
echo ""
echo "請在瀏覽器中打開: http://172.238.14.142"
echo ""
