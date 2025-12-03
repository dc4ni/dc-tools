#!/usr/bin/expect -f

set timeout 60

puts "========================================="
puts "上傳 DownloadButton 並重啟前端"
puts "=========================================\n"

# 上傳 DownloadButton.jsx
puts "上傳 DownloadButton.jsx..."
spawn scp /Users/dc/Desktop/code/DirectConverter/frontend/src/components/DownloadButton.jsx root@172.238.14.142:/opt/directconverter/frontend/src/components/DownloadButton.jsx
expect "password:"
send "@Joendle396\r"
expect eof

# 重啟前端
spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '停止並重新建置前端...'\r"
expect "root@*"
send "docker-compose stop frontend\r"
expect "root@*"
send "docker-compose rm -f frontend\r"
expect "root@*"
send "docker-compose up -d --build frontend\r"
expect "root@*"

send "sleep 8\r"
expect "root@*"

send "echo '\n=== 容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 前端日誌 ==='\r"
expect "root@*"
send "docker-compose logs --tail=10 frontend\r"
expect "root@*"

send "echo '\n=== 測試主頁 ==='\r"
expect "root@*"
send "curl -I http://localhost 2>&1 | head -5\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 前端已更新!"
puts "🌐 請測試下載功能: http://172.238.14.142"
puts "=========================================\n"
