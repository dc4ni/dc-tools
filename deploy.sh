#!/bin/bash

# DirectConverter 部署腳本
# 此腳本用於在 Linode 主機上部署應用

set -e

echo "=== DirectConverter 部署腳本 ==="

# 檢查是否為 root
if [ "$EUID" -ne 0 ]; then 
  echo "請使用 root 權限執行此腳本"
  exit 1
fi

# 更新系統
echo "更新系統套件..."
apt-get update
apt-get upgrade -y

# 安裝必要工具
echo "安裝必要工具..."
apt-get install -y curl git nginx python3 python3-pip python3-venv

# 安裝 Node.js (使用 NodeSource)
echo "安裝 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安裝 Docker (可選,但推薦)
echo "安裝 Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# 安裝 Docker Compose
echo "安裝 Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 創建應用目錄
APP_DIR="/opt/directconverter"
echo "創建應用目錄: $APP_DIR"
mkdir -p $APP_DIR

# 克隆或複製代碼
echo "請手動將代碼上傳到 $APP_DIR"
echo "您可以使用: scp -r DirectConverter/* root@your-server-ip:$APP_DIR/"

echo ""
echo "=== 基礎環境安裝完成 ==="
echo "下一步:"
echo "1. 上傳代碼到 $APP_DIR"
echo "2. 配置環境變數"
echo "3. 執行 docker-compose up -d"
echo ""
