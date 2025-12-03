# 恢復到穩定版本 v1.0.0

## 如何恢復到穩定版本

如果在開發過程中出現問題,想要恢復到 v1.0.0 穩定版本,請執行以下步驟:

### 方法一: Git 恢復 (本地)

```bash
cd /Users/dc/Desktop/code/DirectConverter
git checkout v1.0.0
```

### 方法二: 手動恢復特定檔案

如果只想恢復特定檔案:

```bash
# 恢復版本號
git checkout v1.0.0 -- frontend/src/components/SideMenu.jsx
git checkout v1.0.0 -- frontend/src/components/ImageConverterTool.jsx
git checkout v1.0.0 -- frontend/src/components/ImageResizeCropTool.jsx

# 上傳到伺服器
expect -c '
spawn scp frontend/src/components/SideMenu.jsx frontend/src/components/ImageConverterTool.jsx frontend/src/components/ImageResizeCropTool.jsx root@172.238.14.142:/tmp/
expect "password:"
send "@Joendle396\r"
expect eof
'

# SSH 到伺服器並部署
expect -c '
set timeout 300
spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"
send "cd /opt/directconverter\r"
expect "root@*"
send "cp /tmp/SideMenu.jsx frontend/src/components/\r"
expect "root@*"
send "cp /tmp/ImageConverterTool.jsx frontend/src/components/\r"
expect "root@*"
send "cp /tmp/ImageResizeCropTool.jsx frontend/src/components/\r"
expect "root@*"
send "docker-compose build --no-cache frontend\r"
expect "root@*"
send "docker-compose stop frontend\r"
expect "root@*"
send "docker-compose rm -f frontend\r"
expect "root@*"
send "docker-compose up -d frontend\r"
expect "root@*"
send "exit\r"
expect eof
'
```

## v1.0.0 穩定版本資訊

### 版本號顯示位置
- **全域版本** (Footer): `DC Tools v1.0.0`
- **圖片轉換工具**: 右下角浮動標籤顯示 `v1.0.0`
- **圖片裁切工具**: 右下角浮動標籤顯示 `v1.0.0`

### 功能清單
- ✅ 圖片格式轉換 (JPEG, PNG, WebP, GIF, BMP)
- ✅ 圖片裁切調整 (拖曳裁切框、尺寸設定)
- ✅ 品質調整 (JPEG/WebP 支援 0-100%)
- ✅ 獨立 URL 路由系統
  - 首頁: https://dc-tools.cc/
  - 圖片轉換: https://dc-tools.cc/img_transfer
  - 圖片裁切: https://dc-tools.cc/img_resize
- ✅ HTTPS SSL 安全連線
- ✅ SEO 優化
- ✅ 響應式設計

### 技術規格
- **Frontend**: React 18.2.0 + Vite 5.0.8 + React Router 6.20.0
- **Backend**: Python 3.9 + FastAPI
- **Deployment**: Docker Compose + Nginx
- **Domain**: dc-tools.cc
- **SSL**: Let's Encrypt (自動更新)

### 部署環境
- **伺服器**: Ubuntu 24.04.3 LTS
- **IP**: 172.238.14.142
- **SSH**: root@172.238.14.142 (密碼: @Joendle396)
- **專案路徑**: /opt/directconverter

## 建立新版本

當你對新功能滿意並想建立新的穩定版本時:

```bash
# 更新版本號到新版本 (例如 v1.1.0)
# 修改 frontend/src/components/SideMenu.jsx 中的版本號
# 修改 frontend/src/components/ImageConverterTool.jsx 中的版本號
# 修改 frontend/src/components/ImageResizeCropTool.jsx 中的版本號

# 提交變更
git add -A
git commit -m "Release v1.1.0 - 新功能描述"

# 建立新標籤
git tag -a v1.1.0 -m "穩定版本 v1.1.0

新功能:
- 功能 1 描述
- 功能 2 描述
"

# 查看所有標籤
git tag -l
```

## 緊急恢復指令 (一鍵恢復)

```bash
cd /Users/dc/Desktop/code/DirectConverter && \
git checkout v1.0.0 -- frontend/src/components/SideMenu.jsx frontend/src/components/ImageConverterTool.jsx frontend/src/components/ImageResizeCropTool.jsx && \
echo "檔案已恢復到 v1.0.0,請執行部署腳本"
```
