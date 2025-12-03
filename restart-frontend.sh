#!/usr/bin/expect -f

set timeout 60

puts "========================================="
puts "更新前端配置並重啟"
puts "=========================================\n"

# 上傳 vite.config.js
puts "上傳 vite.config.js..."
spawn scp /Users/dc/Desktop/code/DirectConverter/frontend/vite.config.js root@172.238.14.142:/opt/directconverter/frontend/vite.config.js
expect "password:"
send "@Joendle396\r"
expect eof

# 重啟前端容器
spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"
send "docker-compose restart frontend\r"
expect "root@*"
send "sleep 5\r"
expect "root@*"

send "echo '\n=== 檢查前端容器 ==='\r"
expect "root@*"
send "docker-compose logs --tail=20 frontend\r"
expect "root@*"

send "echo '\n=== 測試前端連接 ==='\r"
expect "root@*"
send "curl -I http://localhost:3000 2>&1 | head -10\r"
expect "root@*"

send "echo '\n=== 測試 Nginx 代理 ==='\r"
expect "root@*"
send "curl -I http://localhost 2>&1 | head -10\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 前端已更新並重啟!"
puts "========================================="
