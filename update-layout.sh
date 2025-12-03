#!/usr/bin/expect -f

set timeout 90

puts "========================================="
puts "更新前端樣式 - 上傳區域置中"
puts "=========================================\n"

# 上傳 CSS 檔案
puts "上傳 ImageConverterTool.css..."
spawn scp /Users/dc/Desktop/code/DirectConverter/frontend/src/components/ImageConverterTool.css root@172.238.14.142:/opt/directconverter/frontend/src/components/ImageConverterTool.css
expect "password:"
send "@Joendle396\r"
expect eof

# 重新建置前端
spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '停止前端容器...'\r"
expect "root@*"
send "docker-compose stop frontend\r"
expect "root@*"

send "docker-compose rm -f frontend\r"
expect "root@*"

send "echo '\n重新建置前端...'\r"
expect "root@*"
send "docker-compose up -d --build frontend\r"
expect "root@*"

send "sleep 8\r"
expect "root@*"

send "echo '\n=== 容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 測試前端 ==='\r"
expect "root@*"
send "curl -I http://localhost 2>&1 | head -5\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 前端樣式已更新!"
puts "🎨 上傳區域現在會在電腦寬度時置中顯示"
puts "🌐 請重新整理頁面: http://172.238.14.142"
puts "=========================================\n"
