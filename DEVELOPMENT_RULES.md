# DirectConverter 開發規則

## 🚨 AI 助手必讀

**⚠️ 重要**: 每次與使用者對話前,AI 助手必須先閱讀並遵循此文件中的所有規範!

### AI 工作流程
1. ✅ **對話開始** → 先閱讀 `DEVELOPMENT_RULES.md`
2. ✅ **執行任務** → 遵循文件中的所有規則和流程
3. ✅ **部署完成** → 執行「部署前自我檢查清單」
4. ✅ **告知使用者** → 只有在所有檢查通過後才說「完成,可以測試」

---

## 📋 目錄
- [專案資訊](#專案資訊)
- [版本管理規則](#版本管理規則)
- [部署流程](#部署流程)
- [前端開發規範](#前端開發規範)
- [後端開發規範](#後端開發規範)
- [Docker 相關](#docker-相關)
- [常見問題處理](#常見問題處理)

---

## 專案資訊

### 伺服器資訊
- **IP**: 172.238.14.142
- **SSH 密碼**: @Joendle396
- **專案路徑**: `/opt/directconverter`
- **前端 Port**: 3000
- **後端 Port**: 8000

### 技術棧
- **前端**: React + Vite
- **後端**: Python 3.9 + FastAPI
- **容器化**: Docker + docker-compose
- **Web Server**: serve (前端), uvicorn (後端)

---

## 版本管理規則

### ⚠️ 重要規則：每次修改必須更新版本號碼

**檔案位置**: `frontend/src/components/ImageConverterTool.jsx`

**版本號碼位置** (在組件最底部):
```jsx
<div style={{ 
  position: 'fixed', 
  bottom: '10px', 
  right: '10px', 
  background: '#4CAF50',  // ← 每次改變顏色
  color: 'white', 
  padding: '8px 16px', 
  borderRadius: '6px', 
  fontSize: '14px',
  fontWeight: 'bold',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  zIndex: 9999
}}>
  v2.1.0 - 防止重複轉換  // ← 更新版本號和說明
</div>
```

### 版本號規則
- **格式**: `v主版本.次版本.修訂版本 - 更新說明`
- **主版本** (v2.x.x): 重大功能改變或架構調整
- **次版本** (vx.1.x): 新功能或重要功能改進
- **修訂版** (vx.x.1): Bug 修復或小改進

### 版本顏色代碼 (用於快速識別更新)
- `#2196F3` - 藍色 (v2.0.x)
- `#4CAF50` - 綠色 (v2.1.x)
- `#FF9800` - 橙色 (v2.2.x)
- `#9C27B0` - 紫色 (v2.3.x)
- `#F44336` - 紅色 (v2.4.x)
- `#00BCD4` - 青色 (v2.5.x)

### 版本歷史
- **v2.0.0** - 下載按鈕內聯版本 (藍色)
- **v2.1.0** - 防止重複轉換 (綠色)

---

## 部署流程

### 完整部署步驟

#### 1. Frontend 部署

```bash
# 步驟 1: 更新版本號碼和顏色 (在 ImageConverterTool.jsx)
# 步驟 2: 本地建置
cd /Users/dc/Desktop/code/DirectConverter/frontend
npm run build

# 步驟 3: 上傳到伺服器
expect << 'EOF'
set timeout 60
spawn bash -c "cd /Users/dc/Desktop/code/DirectConverter && scp -r frontend/dist/* root@172.238.14.142:/opt/directconverter/frontend/dist/"
expect "password:"
send "@Joendle396\r"
expect eof
EOF

# 步驟 4: 重啟 frontend 容器
expect << 'EOF'
set timeout 30
spawn ssh root@172.238.14.142 "cd /opt/directconverter && docker-compose restart frontend"
expect "password:"
send "@Joendle396\r"
expect eof
EOF
```

#### 2. Backend 部署

**⚠️ 重要**: Backend 的 app 程式碼不是 volume mount,需要重新 build Docker image

```bash
# 步驟 1: 上傳修改的檔案
scp backend/app/xxx.py root@172.238.14.142:/opt/directconverter/backend/app/

# 步驟 2: 重新建置並啟動 (必須!)
expect << 'EOF'
set timeout 300
spawn ssh root@172.238.14.142 "cd /opt/directconverter && docker-compose stop backend && docker-compose rm -f backend && docker-compose build --no-cache backend && docker-compose up -d backend"
expect "password:"
send "@Joendle396\r"
expect eof
EOF

# 步驟 3: 驗證容器內的檔案已更新
expect << 'EOF'
set timeout 30
spawn ssh root@172.238.14.142 "docker exec directconverter_backend_1 cat /app/app/config.py | grep -A 10 'CORS_ORIGINS'"
expect "password:"
send "@Joendle396\r"
expect eof
EOF
```

### 快速部署指令

```bash
# Frontend 快速重新部署
cd frontend && npm run build && \
expect << 'EOF'
spawn bash -c "cd /Users/dc/Desktop/code/DirectConverter && scp -r frontend/dist/* root@172.238.14.142:/opt/directconverter/frontend/dist/"
expect "password:"
send "@Joendle396\r"
expect eof
EOF
```

---

## 前端開發規範

### API 配置
**檔案**: `frontend/src/config/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://172.238.14.142:8000'

export const apiEndpoints = {
  formats: `${API_BASE_URL}/api/formats`,
  upload: `${API_BASE_URL}/api/upload`,
  convert: `${API_BASE_URL}/api/convert`,
  download: (url) => `${API_BASE_URL}${url}`
}
```

**使用方式**:
```javascript
import { apiEndpoints } from '../config/api'

// 獲取格式
fetch(apiEndpoints.formats)

// 下載檔案
fetch(apiEndpoints.download(file.download_url))
```

### 防止快取配置
**檔案**: `frontend/index.html`

```html
<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
</head>
```

### 狀態管理規則

**轉換流程狀態**:
```javascript
const [isLoading, setIsLoading] = useState(false)      // 轉換進行中
const [hasConverted, setHasConverted] = useState(false) // 已轉換完成
const [convertedFiles, setConvertedFiles] = useState([]) // 轉換結果

// 上傳新文件時重置
const handleFileUpload = (files) => {
  setUploadedFiles(files)
  setHasConverted(false)    // ← 重要: 重置轉換狀態
  setConvertedFiles([])
}

// 開始轉換
const handleConvert = async () => {
  setIsLoading(true)
  setHasConverted(false)    // ← 開始時重置
  try {
    // ... 轉換邏輯
    setHasConverted(true)   // ← 成功後設為 true
  } finally {
    setIsLoading(false)
  }
}
```

**按鈕禁用規則**:
```javascript
<button 
  disabled={isLoading || hasConverted}  // 轉換中或已完成時禁用
>
  {isLoading ? '轉換中...' : hasConverted ? '✓ 已轉換完成' : '開始轉換'}
</button>
```

---

## 後端開發規範

### CORS 配置
**檔案**: `backend/app/config.py`

```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://172.238.14.142:3000",  # 生產環境
    "http://172.238.14.142",
    "*",  # 允許所有來源 (生產環境可以更嚴格)
]
```

### 檔案結構
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 主程式
│   ├── config.py            # 配置檔案 (CORS, 路徑等)
│   ├── image_converter.py   # 圖片轉換邏輯
│   └── error_log_manager.py # 錯誤日誌管理
├── uploads/                 # 上傳檔案目錄 (volume mount)
├── temp/                    # 臨時檔案目錄 (volume mount)
├── logs/                    # 日誌目錄 (volume mount)
├── Dockerfile
└── requirements.txt
```

---

## Docker 相關

### docker-compose.yml 結構

```yaml
services:
  backend:
    build: ./backend
    volumes:
      - ./backend/uploads:/app/uploads      # 資料目錄
      - ./backend/temp:/app/temp
      - ./backend/logs:/app/logs
      # ⚠️ 注意: app 程式碼不是 volume,在 Docker image 內

  frontend:
    build: ./frontend
    volumes:
      - ./frontend/dist:/app/dist           # 靜態檔案目錄
```

### 重要概念

**Backend app 程式碼更新流程**:
1. ❌ **錯誤做法**: 只上傳檔案然後 restart
   - 因為 app 目錄不是 volume mount
   - restart 只會重啟容器,不會更新程式碼

2. ✅ **正確做法**: 重新 build image
   ```bash
   docker-compose build --no-cache backend
   docker-compose up -d backend
   ```

**Frontend 靜態檔案更新**:
- ✅ 可以直接覆蓋 `dist/` 目錄後 restart
- 因為 dist 是 volume mount

### 常用 Docker 指令

```bash
# 查看容器狀態
docker-compose ps

# 查看容器日誌
docker-compose logs -f backend
docker-compose logs -f frontend

# 進入容器
docker exec -it directconverter_backend_1 bash
docker exec -it directconverter_frontend_1 sh

# 檢查容器內檔案
docker exec directconverter_backend_1 cat /app/app/config.py

# 完全重建容器
docker-compose down
docker-compose up -d --build
```

---

## 常見問題處理

### 問題 1: 瀏覽器快取導致看不到更新

**症狀**: 版本號碼沒有更新,看到舊版本

**解決方案**:
1. **清除伺服器舊檔案**:
   ```bash
   ssh root@172.238.14.142 "cd /opt/directconverter/frontend/dist/assets && rm -f index-*.js index-*.css"
   ```

2. **上傳新檔案並重啟**:
   ```bash
   scp -r frontend/dist/* root@172.238.14.142:/opt/directconverter/frontend/dist/
   ssh root@172.238.14.142 "cd /opt/directconverter && docker-compose restart frontend"
   ```

3. **瀏覽器強制重新整理**:
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + F5`
   - 或開啟開發者工具後右鍵重新整理 → 「清空快取並強制重新整理」

### 問題 2: CORS 錯誤

**症狀**: 
```
Access to fetch at 'http://172.238.14.142:8000/api/xxx' from origin 'http://172.238.14.142:3000' has been blocked by CORS policy
```

**檢查清單**:
1. ✅ 檢查 `backend/app/config.py` 中的 `CORS_ORIGINS`
2. ✅ 確認 backend 容器已重新 build (不是只 restart)
3. ✅ 驗證容器內的配置:
   ```bash
   docker exec directconverter_backend_1 cat /app/app/config.py | grep CORS_ORIGINS
   ```

### 問題 3: Backend 修改沒有生效

**原因**: Backend app 程式碼在 Docker image 內,不是 volume mount

**解決方案**: 必須重新 build image
```bash
cd /opt/directconverter
docker-compose stop backend
docker-compose rm -f backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### 問題 4: 轉換功能異常

**檢查步驟**:
1. 查看 backend 日誌:
   ```bash
   docker-compose logs -f backend
   ```

2. 檢查檔案權限:
   ```bash
   docker exec directconverter_backend_1 ls -la /app/uploads
   docker exec directconverter_backend_1 ls -la /app/temp
   ```

3. 檢查 API 回應:
   ```bash
   curl http://172.238.14.142:8000/api/formats
   ```

---

## 開發工作流程

### 新功能開發流程

1. **本地開發**
   ```bash
   # Frontend
   cd frontend
   npm run dev  # localhost:5173
   
   # Backend
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **測試功能**
   - 確保功能正常運作
   - 測試邊界情況和錯誤處理

3. **更新版本號碼** (⚠️ 重要)
   - 修改 `ImageConverterTool.jsx` 底部版本標籤
   - 更新版本號碼
   - 改變背景顏色
   - 寫清楚更新說明

4. **部署到生產環境**
   - Frontend: build → upload → restart
   - Backend: upload → rebuild → restart

5. **驗證部署**
   - 檢查版本號碼是否更新
   - 測試新功能是否正常
   - 檢查日誌是否有錯誤

### ⚠️ 部署前自我檢查清單 (AI 必須執行)

**在告知使用者「完成,可以測試」之前,AI 必須先執行以下驗證**:

#### 1. 檔案版本確認
```bash
# 檢查本機檔案
cat frontend/src/components/ImageConverterTool.jsx | grep "v2\."

# 檢查雲端檔案 (JS bundle 內容)
ssh root@172.238.14.142 "grep -o 'v2\.[0-9]\.[0-9]' /opt/directconverter/frontend/dist/assets/index-*.js | head -1"
```

**驗證標準**: 本機和雲端版本號碼必須一致

#### 2. 前端網站可訪問性測試
```bash
# 測試首頁可以訪問
curl -I http://172.238.14.142:3000

# 預期結果: HTTP/1.1 200 OK
```

#### 3. 後端 API 端點測試
```bash
# 測試 API 可以訪問
curl http://172.238.14.142:8000/api/formats

# 預期結果: JSON 格式的支援格式列表
```

#### 4. 容器狀態檢查
```bash
# 檢查容器是否正常運行
ssh root@172.238.14.142 "cd /opt/directconverter && docker-compose ps"

# 預期結果: backend 和 frontend 都是 Up 狀態
```

#### 5. 日誌檢查
```bash
# 檢查是否有錯誤
ssh root@172.238.14.142 "docker logs --tail 50 directconverter_backend_1 | grep -i error"
ssh root@172.238.14.142 "docker logs --tail 50 directconverter_frontend_1 | grep -i error"

# 預期結果: 沒有嚴重錯誤
```

**✅ 只有以上所有檢查都通過後,才能告知使用者「部署完成,請測試」**

---

## 快速參考

### SSH 連線
```bash
ssh root@172.238.14.142
# 密碼: @Joendle396
```

### 常用路徑
```bash
# 伺服器
/opt/directconverter/           # 專案根目錄
/opt/directconverter/frontend/dist/    # Frontend 靜態檔案
/opt/directconverter/backend/app/      # Backend 程式碼

# 本地
/Users/dc/Desktop/code/DirectConverter/
```

### 快速檢查指令
```bash
# 檢查容器狀態
docker-compose ps

# 檢查 backend 配置
docker exec directconverter_backend_1 cat /app/app/config.py

# 檢查 frontend 版本
curl -s http://172.238.14.142:3000 | grep "v2"

# 測試 API
curl http://172.238.14.142:8000/api/formats
```

---

## 注意事項

### ⚠️ 重要提醒

1. **每次修改必須更新版本號碼** - 方便追蹤和驗證部署
2. **Backend 修改必須 rebuild** - 程式碼在 image 內
3. **Frontend 更新檢查版本標籤** - 確保瀏覽器載入新版本
4. **CORS 配置修改必須 rebuild backend** - 不是只 restart
5. **測試時清除瀏覽器快取** - 避免看到舊版本
6. **⭐ 部署完成前必須自行驗證** - 在告知完成前,必須先自行測試確保一切正常

### 🔧 除錯技巧

1. **使用開發者工具 Network 標籤**
   - 查看實際載入的 JS/CSS 檔案名稱
   - 確認 API 請求和回應

2. **查看 Docker 容器日誌**
   - Backend 錯誤會出現在日誌中
   - 有助於快速定位問題

3. **驗證容器內檔案**
   - 使用 `docker exec` 確認檔案內容
   - 確保修改確實進入容器

---

**文件版本**: v1.0.0  
**最後更新**: 2025-12-02  
**維護者**: AI Assistant & DC
