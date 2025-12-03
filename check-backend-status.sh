#!/usr/bin/expect -f

set timeout 30

puts "========================================="
puts "檢查後端狀態"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '=== 容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 後端日誌(最近50行) ==='\r"
expect "root@*"
send "docker-compose logs --tail=50 backend\r"
expect "root@*"

send "echo '\n=== 測試後端 API ==='\r"
expect "root@*"
send "curl http://localhost:8000/api/formats 2>&1\r"
expect "root@*"

send "echo '\n=== 通過 Nginx 測試 ==='\r"
expect "root@*"
send "curl http://localhost/api/formats 2>&1\r"
expect "root@*"

send "exit\r"
expect eof
