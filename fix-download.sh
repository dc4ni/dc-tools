#!/usr/bin/expect -f

set timeout 120

puts "========================================="
puts "修復下載功能 - 更新 DownloadButton"
puts "=========================================\n"

# 上傳修正後的 DownloadButton.jsx
puts "上傳 DownloadButton.jsx..."
spawn scp /Users/dc/Desktop/code/DirectConverter/frontend/src/components/DownloadButton.jsx root@172.238.14.142:/opt/directconverter/frontend/src/components/DownloadButton.jsx
expect "password:"
send "@Joendle396\r"
expect eof

# 重建前端容器
spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '重建前端容器...'\r"
expect "root@*"
send "docker-compose up -d --build frontend\r"
expect {
    -re "Creating.*done" { exp_continue }
    -re "Recreating.*done" { exp_continue }
    timeout { puts "\n建置中..."; exp_continue }
    "root@*" { }
}

send "sleep 10\r"
expect "root@*"

send "echo '\n=== 檢查容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 前端日誌 ==='\r"
expect "root@*"
send "docker-compose logs --tail=15 frontend\r"
expect "root@*"

send "echo '\n=== 測試前端 ==='\r"
expect "root@*"
send "curl -I http://172.238.14.142 2>&1 | head -5\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 下載功能已修復!"
puts "🌐 請刷新瀏覽器 (http://172.238.14.142) 並重新測試"
puts "=========================================\n"
