#!/usr/bin/expect -f

# 最終修復並完成部署

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "\n========================================="
puts "最終修復並完成部署"
puts "=========================================\n"

puts "上傳修復後的 main.py..."
spawn scp /Users/dc/Desktop/code/DirectConverter/backend/app/main.py root@$server_ip:$app_dir/backend/app/main.py
expect {
    "password:" {
        send "$password\r"
    }
}
expect eof
sleep 2

puts "\n連線到伺服器並重啟應用..."
spawn ssh root@$server_ip
expect {
    "password:" {
        send "$password\r"
    }
}

expect "#"
send "cd $app_dir\r"
expect "#"

puts "\n重啟後端容器..."
send "docker-compose restart backend\r"
expect "#" { sleep 10 }

puts "\n等待服務啟動..."
sleep 10

puts "\n查看容器狀態..."
send "docker-compose ps\r"
expect "#"

puts "\n查看後端日誌..."
send "docker-compose logs --tail=30 backend\r"
expect "#" { sleep 2 }

puts "\n測試後端健康檢查..."
send "curl -s http://localhost:8000/api | head -20\r"
expect "#" { sleep 2 }

puts "\n測試前端..."
send "curl -I http://localhost:3000\r"
expect "#"

puts "\n測試 Nginx..."
send "curl -I http://localhost\r"
expect "#"

send "exit\r"
expect eof

puts "\n================================================"
puts "🎉 部署完成!"
puts "================================================\n"
puts "訪問網址: http://172.238.14.142"
puts "\n請在瀏覽器中打開查看您的應用!"
puts "================================================\n"
