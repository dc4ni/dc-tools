# DC Tools - 最好用的線上轉換工具# 🎨 圖片轉換工具 - Image Converter



<div align="center">一個強大的網頁圖片轉換工具，支持多種圖片格式轉換。本地處理，完全保護隱私。



[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/dc4ni/dc-tools/releases/tag/v1.0.0)## ✨ 主要功能

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[![Live Demo](https://img.shields.io/badge/demo-dc--tools.cc-brightgreen.svg)](https://dc-tools.cc)- ✅ **多格式支持**: PNG、JPG、GIF、BMP、WEBP 相互轉換

- ✅ **拖拽上傳**: 直觀的拖拽上傳界面

**免費、快速、安全的線上圖片處理工具**- ✅ **批量轉換**: 一次上傳多張圖片，批量轉換

- ✅ **質量控制**: 可調整轉換質量（1-100%）

[🌐 立即使用](https://dc-tools.cc) | [📖 使用說明](#使用說明) | [🚀 功能特色](#功能特色) | [🛠️ 技術架構](#技術架構)- ✅ **本地處理**: 所有處理在本地完成，隱私有保障

- ✅ **實時預覽**: 上傳和轉換後的圖片實時預覽

</div>- ✅ **響應式設計**: 完美支持桌面和移動設備



---## 🛠️ 技術棧



## 📸 預覽### 後端

- **框架**: FastAPI

<div align="center">- **圖片處理**: Pillow (PIL)

- **服務器**: Uvicorn

### 🏠 首頁- **語言**: Python 3.8+

簡潔優雅的工具選擇介面

### 前端

### 🔄 圖片格式轉換- **框架**: React 18

支援 JPEG, PNG, WebP, GIF, BMP 互轉- **構建工具**: Vite

- **HTTP 客戶端**: Axios

### ✂️ 圖片裁切調整- **樣式**: CSS3

拖曳式裁切框，直覺操作

## 📦 項目結構

</div>

```

---DirectConverter/

├── backend/

## 🌟 功能特色│   ├── app/

│   │   ├── __init__.py

### 🔄 圖片格式轉換工具│   │   ├── config.py              # 配置文件

- ✅ 支援多種格式互轉：JPEG, PNG, WebP, GIF, BMP│   │   ├── image_converter.py     # 圖片轉換邏輯

- ✅ 品質自訂調整（0-100%）│   │   └── main.py                # FastAPI 主應用

- ✅ 即時預覽轉換結果│   ├── uploads/                   # 上傳文件夾

- ✅ 檔案大小比較│   ├── temp/                      # 臨時文件夾

- ✅ 拖放上傳，操作便捷│   ├── requirements.txt           # Python 依賴

│   └── .env.example               # 環境變量示例

### ✂️ 圖片裁切調整工具│

- ✅ 視覺化裁切框（九宮格輔助線）├── frontend/

- ✅ 拖曳移動和調整大小│   ├── src/

- ✅ 精確尺寸輸入│   │   ├── components/

- ✅ 邊界自動約束│   │   │   ├── FileUploader.jsx       # 文件上傳組件

- ✅ 同步支援格式轉換和品質調整│   │   │   ├── ConversionOptions.jsx  # 轉換選項組件

│   │   │   ├── ImagePreview.jsx       # 圖片預覽組件

### 🎨 使用者體驗│   │   │   └── DownloadButton.jsx     # 下載按鈕組件

- ✅ 響應式設計，支援所有裝置│   │   ├── App.jsx                # 主應用組件

- ✅ 深色主題，護眼舒適│   │   ├── App.css                # 主應用樣式

- ✅ 獨立 URL 路由，可分享特定工具│   │   ├── index.css              # 全局樣式

- ✅ 無需註冊，即開即用│   │   └── main.jsx               # 入口文件

- ✅ 完全免費，無浮水印│   ├── index.html

│   ├── vite.config.js

---│   ├── package.json

│   └── .env                       # 環境配置

## 🚀 快速開始│

└── README.md                      # 本文件

### 線上使用```



直接訪問 **[https://dc-tools.cc](https://dc-tools.cc)** 即可使用所有功能！## 🚀 快速開始



### 本地部署### 前置條件

- Python 3.8 或更高版本

```bash- Node.js 16 或更高版本

# 1. Clone repository- npm 或 yarn

git clone https://github.com/dc4ni/dc-tools.git

cd dc-tools### 1️⃣ 後端設置



# 2. 使用 Docker Compose 啟動```bash

docker-compose up -d# 進入後端目錄

cd backend

# 3. 訪問服務

# Frontend: http://localhost:3000# 創建 Python 虛擬環境

# Backend API: http://localhost:8000python3 -m venv venv

```

# 激活虛擬環境

---# macOS/Linux

source venv/bin/activate

## 📖 使用說明# Windows

# venv\Scripts\activate

### 圖片格式轉換

# 安裝依賴

1. 訪問 [https://dc-tools.cc/img_transfer](https://dc-tools.cc/img_transfer)pip install -r requirements.txt

2. 上傳圖片（拖放或點擊選擇）

3. 選擇目標格式# 運行服務器

4. 調整品質設定（可選）python -m app.main

5. 點擊「開始轉換」

6. 下載轉換後的圖片# 或使用 uvicorn

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

### 圖片裁切調整```



1. 訪問 [https://dc-tools.cc/img_resize](https://dc-tools.cc/img_resize)後端服務將在 `http://localhost:8000` 運行

2. 上傳圖片

3. 拖曳裁切框調整位置### 2️⃣ 前端設置

4. 拖曳角落控制點調整大小

5. 或輸入精確的寬度和高度```bash

6. 選擇輸出格式（可選）# 進入前端目錄

7. 點擊「開始處理」cd frontend

8. 下載處理後的圖片

# 安裝依賴

---npm install



## 🛠️ 技術架構# 運行開發服務器

npm run dev

### Frontend

- **框架**: React 18.2.0# 構建生產版本

- **建置工具**: Vite 5.0.8npm run build

- **路由**: React Router DOM 6.20.0```

- **HTTP 客戶端**: Axios 1.6.0

- **樣式**: 原生 CSS（響應式設計）前端應用將在 `http://localhost:3000` 運行



### Backend## 📚 API 文檔

- **語言**: Python 3.9

- **框架**: FastAPI### 獲取支持的格式

- **圖片處理**: Pillow```

- **日誌**: JSON 格式GET /api/formats

```

### 基礎設施

- **容器化**: Docker + Docker Compose### 上傳圖片

- **反向代理**: Nginx```

- **SSL**: Let's Encrypt（自動續期）POST /api/upload

- **作業系統**: Ubuntu 24.04 LTSContent-Type: multipart/form-data

Body: {file}

---```



## 📁 專案結構### 轉換單個圖片

```

```POST /api/convert

dc-tools/Content-Type: multipart/form-data

├── frontend/                 # React 前端應用Body: {file_id, output_format, quality}

│   ├── src/```

│   │   ├── components/      # React 元件

│   │   │   ├── Home.jsx            # 首頁### 批量轉換

│   │   │   ├── Header.jsx          # 導航列```

│   │   │   ├── ImageConverterTool.jsx  # 格式轉換工具POST /api/batch-convert

│   │   │   ├── ImageResizeCropTool.jsx # 裁切工具Content-Type: multipart/form-data

│   │   │   └── ...Body: {files[], output_format, quality}

│   │   ├── config/          # 配置檔案```

│   │   ├── services/        # API 服務

│   │   └── main.jsx         # 入口檔案### 下載轉換後的圖片

│   ├── Dockerfile```

│   └── package.jsonGET /api/download/{filename}

├── backend/                  # Python 後端 API```

│   ├── app/

│   │   ├── main.py          # FastAPI 應用### 清理文件

│   │   ├── image_converter.py    # 圖片處理邏輯```

│   │   └── config.py        # 配置DELETE /api/cleanup

│   ├── Dockerfile```

│   └── requirements.txt

├── nginx.conf               # Nginx 配置## ⚙️ 環境變量

├── docker-compose.yml       # Docker Compose 配置

└── README.md### 後端 (.env)

``````

UPLOAD_DIR=./uploads

---TEMP_DIR=./temp

MAX_FILE_SIZE=52428800          # 50MB

## 🔧 開發指南ALLOWED_FORMATS=png,jpg,jpeg,gif,bmp,webp

```

### 環境需求

- Node.js 18+## 🎯 支持的轉換

- Python 3.9+

- Docker & Docker Compose- PNG ↔ JPG/JPEG

- PNG ↔ WEBP

### 本地開發- PNG ↔ GIF

- PNG ↔ BMP

#### Frontend- JPG ↔ WEBP

```bash- JPG ↔ GIF

cd frontend- JPG ↔ BMP

npm install- ... 以及其他所有格式組合

npm run dev

# 開發伺服器: http://localhost:5173## 📋 配置說明

```

### 文件大小限制

#### Backend默認最大 50MB，可在 `backend/app/config.py` 中修改：

```bash```python

cd backendMAX_FILE_SIZE = 50 * 1024 * 1024  # 修改此值

pip install -r requirements.txt```

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API 伺服器: http://localhost:8000### 轉換質量設置

```在 `backend/app/config.py` 中配置：

```python

### 建置部署QUALITY_SETTINGS = {

```bash    "jpg": 85,

# 建置 Docker images    "webp": 85,

docker-compose build    "png": 9,

}

# 啟動所有服務```

docker-compose up -d

### CORS 設置

# 查看運行狀態在 `backend/app/main.py` 中修改允許的來源：

docker-compose ps```python

CORS_ORIGINS = [

# 查看日誌    "http://localhost:3000",

docker-compose logs -f    # 添加更多來源

```]

```

---

## 🧪 測試

## 📊 API 文件

### 使用 cURL 測試上傳

### 端點```bash

curl -X POST -F "file=@/path/to/image.png" http://localhost:8000/api/upload

#### 取得支援格式```

```http

GET /api/formats### 使用 Python 測試

``````python

import requests

#### 轉換圖片格式

```httpfiles = {'file': open('image.png', 'rb')}

POST /api/convertresponse = requests.post('http://localhost:8000/api/upload', files=files)

Content-Type: multipart/form-dataprint(response.json())

```

Parameters:

- file: 圖片檔案## 🔒 隱私和安全

- format: 目標格式 (jpeg|png|webp|gif|bmp)

- quality: 品質 (0-100, 可選)- ✅ 所有圖片處理都在本地完成

```- ✅ 不上傳任何文件到遠程服務器

- ✅ 支持自定義部署

#### 裁切圖片- ✅ 臨時文件會自動清理

```http

POST /api/resize## 🚀 生產部署

Content-Type: multipart/form-data

### 使用 Docker

Parameters:```dockerfile

- file: 圖片檔案# Dockerfile 示例

- width: 寬度FROM python:3.9-slim

- height: 高度

- crop_x: 裁切起始 X 座標WORKDIR /app

- crop_y: 裁切起始 Y 座標COPY backend/requirements.txt .

- crop_width: 裁切寬度RUN pip install -r requirements.txt

- crop_height: 裁切高度

- format: 輸出格式 (可選)COPY backend/ .

- quality: 品質 (可選)

```CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

```

完整 API 文件: [http://localhost:8000/docs](http://localhost:8000/docs)

### 使用 Docker Compose

---```yaml

version: '3'

## 🌐 部署

services:

### 生產環境  backend:

    build: ./backend

1. **設定網域 DNS**    ports:

   - 將 A record 指向伺服器 IP      - "8000:8000"

    volumes:

2. **設定 SSL 憑證**      - ./backend/uploads:/app/uploads

   ```bash      - ./backend/temp:/app/temp

   sudo certbot --nginx -d your-domain.com

   ```  frontend:

    build: ./frontend

3. **更新 Nginx 配置**    ports:

   ```bash      - "3000:3000"

   # 編輯 nginx.conf    depends_on:

   server_name your-domain.com;      - backend

   ``````



4. **啟動服務**## 🐛 故障排除

   ```bash

   docker-compose up -d### 後端無法啟動

   ```- 確保 Python 版本 ≥ 3.8

- 確保所有依賴已安裝：`pip install -r requirements.txt`

---- 檢查端口 8000 是否被占用



## 📝 版本紀錄### 前端無法連接到後端

- 確保後端已在 http://localhost:8000 運行

### v1.0.0 (2025-12-03)- 檢查 CORS 設置

- 🎉 首次發布- 查看瀏覽器開發者工具中的網絡標籤

- ✨ 圖片格式轉換功能

- ✨ 圖片裁切調整功能### 圖片轉換失敗

- ✨ 獨立 URL 路由系統- 確保圖片格式被支持

- 🔒 HTTPS 支援- 檢查文件大小是否超過限制

- 📱 響應式設計- 查看後端日誌獲取詳細錯誤信息



查看完整 [CHANGELOG](RELEASE_v1.0.0.md)## 📝 許可證



---MIT License



## 🤝 貢獻## 👨‍💻 作者



歡迎提交 Issue 和 Pull Request！DirectConverter Development Team



1. Fork 本專案---

2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)

3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)有任何問題或建議，歡迎提出 Issue！🙌

4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

---

## 🔗 相關連結

- **線上服務**: [https://dc-tools.cc](https://dc-tools.cc)
- **GitHub**: [https://github.com/dc4ni/dc-tools](https://github.com/dc4ni/dc-tools)
- **問題回報**: [GitHub Issues](https://github.com/dc4ni/dc-tools/issues)

---

## 📞 聯絡方式

如有任何問題或建議，歡迎透過以下方式聯絡：

- **GitHub Issues**: [提交問題](https://github.com/dc4ni/dc-tools/issues)
- **網站**: [dc-tools.cc](https://dc-tools.cc)

---

<div align="center">

**⭐ 如果這個專案對你有幫助，請給個星星支持！⭐**

Made with ❤️ by [dc4ni](https://github.com/dc4ni)

</div>
