#!/usr/bin/expect -f

# 檢查部署狀態

set timeout 60
set server_ip "172.238.14.142"
set password "@Joendle396"

puts "\n========================================="
puts "檢查部署狀態"
puts "=========================================\n"

spawn ssh root@$server_ip
expect {
    "password:" {
        send "$password\r"
    }
}

expect "#"
send "cd /opt/directconverter\r"
expect "#"

send "docker-compose ps\r"
expect "#" { sleep 2 }

send "echo '\n=== 後端日誌 ==='\r"
expect "#"
send "docker-compose logs --tail=40 backend\r"
expect "#" { sleep 2 }

send "echo '\n=== 前端日誌 ==='\r"
expect "#"
send "docker-compose logs --tail=20 frontend\r"
expect "#" { sleep 2 }

send "echo '\n=== 測試服務 ==='\r"
expect "#"
send "curl -I http://localhost 2>&1 | head -15\r"
expect "#"

send "exit\r"
expect eof

puts "\n========================================="
puts "檢查完成"
puts "=========================================\n"
