#!/usr/bin/expect -f

set timeout 30

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"
send "docker-compose logs --tail=50 frontend\r"
expect "root@*"
send "curl -v http://localhost:3000 2>&1 | head -30\r"
expect "root@*"
send "exit\r"
expect eof
