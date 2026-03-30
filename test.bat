@echo off
chcp 65001 >nul
echo ========================================
echo MediaTools 功能测试脚本
echo ========================================
echo.

echo [1/5] 启动本地后端服务...
cd backend
start cmd /k "npm start"
timeout /t 10 /nobreak >nul
cd ..
echo.

echo [2/5] 测试后端 API...
curl -X POST http://localhost:3000/api/douyin/remove-watermark ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"https://www.douyin.com/video/7234567890123456789\"}"
echo.

echo [3/5] 测试前端页面...
start http://localhost:3000
echo.

echo [4/5] 等待 10 秒...
timeout /t 10 /nobreak >nul
echo.

echo [5/5] 测试完成！
echo.
echo 请手动测试：
echo 1. 访问 http://localhost:3000
echo 2. 输入抖音视频链接
echo 3. 点击"去水印"按钮
echo 4. 查看结果
echo.
pause
