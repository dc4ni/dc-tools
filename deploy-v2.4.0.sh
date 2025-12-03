#!/usr/bin/expect -f

# 部署 v2.4.0 更新 (質量控制優化 + 首頁雙工具顯示)

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "\n========================================="
puts "部署 v2.4.0 更新"
puts "- ImageConverterTool v2.4.0"
puts "- ImageResizeCropTool v1.0.3"
puts "- 首頁雙工具顯示"
puts "=========================================\n"

# 上傳所有修改的組件檔案
set files {
    "frontend/src/components/Home.jsx"
    "frontend/src/components/Home.css"
    "frontend/src/App.jsx"
    "frontend/src/components/Header.jsx"
    "frontend/src/components/Header.css"
    "frontend/src/components/ImageResizeCropTool.jsx"
    "frontend/src/components/ImageResizeCropTool.css"
    "frontend/src/components/ImageConverterTool.jsx"
    "frontend/src/components/ConversionOptions.jsx"
    "frontend/src/components/ConversionOptions.css"
}

foreach file $files {
    puts "\n上傳 $file..."
    spawn scp /Users/dc/Desktop/code/DirectConverter/$file root@$server_ip:$app_dir/$file
    expect {
        "password:" {
            send "$password\r"
        }
    }
    expect eof
    sleep 1
}

puts "\n所有檔案上傳完成,連線到伺服器重建前端..."
spawn ssh root@$server_ip
expect {
    "password:" {
        send "$password\r"
    }
}

expect "#"
send "cd $app_dir\r"
expect "#"

puts "\n停止前端容器..."
send "docker-compose stop frontend\r"
expect "#" { sleep 3 }

puts "\n重建前端映像檔 (無快取)..."
send "docker-compose build --no-cache frontend\r"
expect "#" { sleep 60 }

puts "\n啟動前端容器..."
send "docker-compose up -d frontend\r"
expect "#" { sleep 5 }

puts "\n等待容器啟動..."
sleep 10

puts "\n查看容器狀態..."
send "docker-compose ps\r"
expect "#"

puts "\n查看前端日誌..."
send "docker-compose logs --tail=30 frontend\r"
expect "#" { sleep 2 }

puts "\n測試前端訪問..."
send "curl -I http://localhost:3000 | head -10\r"
expect "#" { sleep 2 }

puts "\n測試 Nginx..."
send "curl -I http://localhost | head -10\r"
expect "#"

send "exit\r"
expect eof

puts "\n================================================"
puts "🎉 v2.4.0 部署完成!"
puts "================================================\n"
puts "更新內容:"
puts "✅ 質量滑桿優化 (僅 JPG/WebP 支援)"
puts "✅ 首頁顯示兩個工具卡片"
puts "✅ 圖片調整/裁切工具 v1.0.3"
puts "✅ 圖片轉換工具 v2.4.0"
puts "\n訪問網址: http://172.238.14.142"
puts "================================================\n"
