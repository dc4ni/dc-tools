#!/usr/bin/expect -f

set timeout 60

puts "========================================="
puts "重啟後端容器"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '重啟後端容器...'\r"
expect "root@*"
send "docker-compose up -d backend\r"
expect "root@*"

send "sleep 5\r"
expect "root@*"

send "echo '\n=== 容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 後端日誌 ==='\r"
expect "root@*"
send "docker-compose logs --tail=20 backend\r"
expect "root@*"

send "echo '\n=== 測試 API ==='\r"
expect "root@*"
send "curl http://localhost:8000/api/formats 2>&1 | python3 -m json.tool 2>/dev/null || curl http://localhost:8000/api/formats 2>&1 | head -5\r"
expect "root@*"

send "echo '\n=== 通過 Nginx 測試 ==='\r"
expect "root@*"
send "curl http://localhost/api/formats 2>&1 | python3 -m json.tool 2>/dev/null || curl http://localhost/api/formats 2>&1 | head -5\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 後端已重啟!"
puts "🌐 請重新測試: http://172.238.14.142"
puts "=========================================\n"
