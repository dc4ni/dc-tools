# 🎨 圖片轉換工具 - Image Converter

一個強大的網頁圖片轉換工具，支持多種圖片格式轉換。本地處理，完全保護隱私。

## ✨ 主要功能

- ✅ **多格式支持**: PNG、JPG、GIF、BMP、WEBP 相互轉換
- ✅ **拖拽上傳**: 直觀的拖拽上傳界面
- ✅ **批量轉換**: 一次上傳多張圖片，批量轉換
- ✅ **質量控制**: 可調整轉換質量（1-100%）
- ✅ **本地處理**: 所有處理在本地完成，隱私有保障
- ✅ **實時預覽**: 上傳和轉換後的圖片實時預覽
- ✅ **響應式設計**: 完美支持桌面和移動設備

## 🛠️ 技術棧

### 後端
- **框架**: FastAPI
- **圖片處理**: Pillow (PIL)
- **服務器**: Uvicorn
- **語言**: Python 3.8+

### 前端
- **框架**: React 18
- **構建工具**: Vite
- **HTTP 客戶端**: Axios
- **樣式**: CSS3

## 📦 項目結構

```
DirectConverter/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # 配置文件
│   │   ├── image_converter.py     # 圖片轉換邏輯
│   │   └── main.py                # FastAPI 主應用
│   ├── uploads/                   # 上傳文件夾
│   ├── temp/                      # 臨時文件夾
│   ├── requirements.txt           # Python 依賴
│   └── .env.example               # 環境變量示例
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.jsx       # 文件上傳組件
│   │   │   ├── ConversionOptions.jsx  # 轉換選項組件
│   │   │   ├── ImagePreview.jsx       # 圖片預覽組件
│   │   │   └── DownloadButton.jsx     # 下載按鈕組件
│   │   ├── App.jsx                # 主應用組件
│   │   ├── App.css                # 主應用樣式
│   │   ├── index.css              # 全局樣式
│   │   └── main.jsx               # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env                       # 環境配置
│
└── README.md                      # 本文件
```

## 🚀 快速開始

### 前置條件
- Python 3.8 或更高版本
- Node.js 16 或更高版本
- npm 或 yarn

### 1️⃣ 後端設置

```bash
# 進入後端目錄
cd backend

# 創建 Python 虛擬環境
python3 -m venv venv

# 激活虛擬環境
# macOS/Linux
source venv/bin/activate
# Windows
# venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 運行服務器
python -m app.main

# 或使用 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

後端服務將在 `http://localhost:8000` 運行

### 2️⃣ 前端設置

```bash
# 進入前端目錄
cd frontend

# 安裝依賴
npm install

# 運行開發服務器
npm run dev

# 構建生產版本
npm run build
```

前端應用將在 `http://localhost:3000` 運行

## 📚 API 文檔

### 獲取支持的格式
```
GET /api/formats
```

### 上傳圖片
```
POST /api/upload
Content-Type: multipart/form-data
Body: {file}
```

### 轉換單個圖片
```
POST /api/convert
Content-Type: multipart/form-data
Body: {file_id, output_format, quality}
```

### 批量轉換
```
POST /api/batch-convert
Content-Type: multipart/form-data
Body: {files[], output_format, quality}
```

### 下載轉換後的圖片
```
GET /api/download/{filename}
```

### 清理文件
```
DELETE /api/cleanup
```

## ⚙️ 環境變量

### 後端 (.env)
```
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_FILE_SIZE=52428800          # 50MB
ALLOWED_FORMATS=png,jpg,jpeg,gif,bmp,webp
```

## 🎯 支持的轉換

- PNG ↔ JPG/JPEG
- PNG ↔ WEBP
- PNG ↔ GIF
- PNG ↔ BMP
- JPG ↔ WEBP
- JPG ↔ GIF
- JPG ↔ BMP
- ... 以及其他所有格式組合

## 📋 配置說明

### 文件大小限制
默認最大 50MB，可在 `backend/app/config.py` 中修改：
```python
MAX_FILE_SIZE = 50 * 1024 * 1024  # 修改此值
```

### 轉換質量設置
在 `backend/app/config.py` 中配置：
```python
QUALITY_SETTINGS = {
    "jpg": 85,
    "webp": 85,
    "png": 9,
}
```

### CORS 設置
在 `backend/app/main.py` 中修改允許的來源：
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    # 添加更多來源
]
```

## 🧪 測試

### 使用 cURL 測試上傳
```bash
curl -X POST -F "file=@/path/to/image.png" http://localhost:8000/api/upload
```

### 使用 Python 測試
```python
import requests

files = {'file': open('image.png', 'rb')}
response = requests.post('http://localhost:8000/api/upload', files=files)
print(response.json())
```

## 🔒 隱私和安全

- ✅ 所有圖片處理都在本地完成
- ✅ 不上傳任何文件到遠程服務器
- ✅ 支持自定義部署
- ✅ 臨時文件會自動清理

## 🚀 生產部署

### 使用 Docker
```dockerfile
# Dockerfile 示例
FROM python:3.9-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 使用 Docker Compose
```yaml
version: '3'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/temp:/app/temp

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 🐛 故障排除

### 後端無法啟動
- 確保 Python 版本 ≥ 3.8
- 確保所有依賴已安裝：`pip install -r requirements.txt`
- 檢查端口 8000 是否被占用

### 前端無法連接到後端
- 確保後端已在 http://localhost:8000 運行
- 檢查 CORS 設置
- 查看瀏覽器開發者工具中的網絡標籤

### 圖片轉換失敗
- 確保圖片格式被支持
- 檢查文件大小是否超過限制
- 查看後端日誌獲取詳細錯誤信息

## 📝 許可證

MIT License

## 👨‍💻 作者

DirectConverter Development Team

---

有任何問題或建議，歡迎提出 Issue！🙌
