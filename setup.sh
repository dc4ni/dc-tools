#!/bin/bash

# Image Converter - Development Setup Script

echo "🎨 圖片轉換工具 - 開發環境設置"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查 Python
echo -e "${YELLOW}檢查 Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 未安裝${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python $(python3 --version)${NC}"
echo ""

# 檢查 Node.js
echo -e "${YELLOW}檢查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安裝${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node $(node --version)${NC}"
echo ""

# 後端設置
echo -e "${YELLOW}設置後端...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo "創建虛擬環境..."
    python3 -m venv venv
fi

echo "激活虛擬環境..."
source venv/bin/activate

echo "安裝 Python 依賴..."
pip install -r requirements.txt

cd ..
echo -e "${GREEN}✅ 後端設置完成${NC}"
echo ""

# 前端設置
echo -e "${YELLOW}設置前端...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "安裝 Node 依賴..."
    npm install
fi

cd ..
echo -e "${GREEN}✅ 前端設置完成${NC}"
echo ""

echo -e "${GREEN}======================================"
echo "✅ 設置完成！"
echo "=====================================${NC}"
echo ""
echo "🚀 開始開發："
echo ""
echo "終端 1 - 後端服務器："
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python -m app.main"
echo ""
echo "終端 2 - 前端開發服務器："
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "後端: http://localhost:8000"
echo "前端: http://localhost:3000"
echo ""
