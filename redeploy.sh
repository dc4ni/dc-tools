#!/usr/bin/expect -f

# 上傳修復後的代碼並重新部署

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "\n========================================="
puts "修復並重新部署"
puts "=========================================\n"

puts "上傳修復後的 requirements.txt..."
spawn scp /Users/dc/Desktop/code/DirectConverter/backend/requirements.txt root@$server_ip:$app_dir/backend/requirements.txt
expect {
    "password:" {
        send "$password\r"
    }
}
expect eof

puts "\n連線到伺服器..."
spawn ssh root@$server_ip
expect {
    "password:" {
        send "$password\r"
    }
}

expect "#"
send "cd $app_dir\r"
expect "#"

puts "\n清理舊的 Docker 映像..."
send "docker-compose down\r"
expect "#"
send "docker system prune -f\r"
expect "#" { sleep 2 }

puts "\n重新建置並啟動..."
send "docker-compose up -d --build\r"
expect "#" { sleep 90 }

puts "\n等待容器啟動..."
sleep 15

puts "\n查看容器狀態..."
send "docker-compose ps\r"
expect "#"

puts "\n查看日誌..."
send "docker-compose logs --tail=50\r"
expect "#" { sleep 3 }

puts "\n測試前端服務..."
send "curl -I http://localhost:3000\r"
expect "#"

puts "\n測試後端服務..."
send "curl -I http://localhost:8000/api\r"
expect "#"

send "exit\r"
expect eof

puts "\n================================================"
puts "🎉 部署完成!"
puts "================================================\n"
puts "訪問網址: http://172.238.14.142"
puts "\n請在瀏覽器中打開測試!"
puts "================================================\n"
