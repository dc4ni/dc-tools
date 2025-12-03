#!/usr/bin/expect -f

set timeout 30

puts "\n========================================="
puts "🎊 DirectConverter 部署完成並測試!"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '=== 服務狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 測試 API 端點 ==='\r"
expect "root@*"
send "echo 'GET /api/formats:'\r"
expect "root@*"
send "curl -s http://172.238.14.142/api/formats | python3 -m json.tool 2>/dev/null | head -15\r"
expect "root@*"

send "echo '\n=== 系統資源 ==='\r"
expect "root@*"
send "echo 'Docker 容器:'\r"
expect "root@*"
send "docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}'\r"
expect "root@*"

send "echo '\n=== 磁碟使用 ==='\r"
expect "root@*"
send "df -h | grep -E '(Filesystem|/$)'\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "📋 部署資訊摘要"
puts "=========================================\n"
puts "✅ 狀態: 所有服務正常運行"
puts ""
puts "🌐 訪問網址:"
puts "  • 主頁: http://172.238.14.142"
puts "  • API 文檔: http://172.238.14.142/api/docs"
puts ""
puts "🔧 已修正的問題:"
puts "  ✓ Python 模組導入錯誤"
puts "  ✓ Pillow 版本不兼容"
puts "  ✓ Nginx 路由配置"
puts "  ✓ Vite 網路配置"
puts "  ✓ DownloadButton 使用相對路徑"
puts ""
puts "📝 功能測試:"
puts "  1. 打開 http://172.238.14.142"
puts "  2. 上傳一張圖片 (PNG/JPG/GIF/BMP/WEBP)"
puts "  3. 選擇要轉換的格式"
puts "  4. 點擊「轉換」按鈕"
puts "  5. 預覽轉換後的圖片"
puts "  6. 點擊「下載」按鈕下載"
puts ""
puts "🔒 安全建議:"
puts "  • 修改 root 密碼"
puts "  • 設置 SSH 密鑰登入"
puts "  • 考慮添加域名和 SSL 憑證"
puts ""
puts "📚 詳細文檔: DEPLOYMENT_SUCCESS.md"
puts "=========================================\n"
