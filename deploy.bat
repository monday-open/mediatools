@echo off
chcp 65001 >nul
echo ========================================
echo MediaTools 自动化部署脚本
echo ========================================
echo.

echo [1/4] 检查环境...
node --version
npm --version
echo.

echo [2/4] 安装依赖...
cd backend
call npm install
cd ..
echo.

echo [3/4] 部署后端到 Vercel...
call vercel --prod
echo.

echo [4/4] 部署前端到 GitHub Pages...
cd frontend
call npm install
call npm run deploy
cd ..
echo.

echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 后端 API: https://mediatools-api.vercel.app
echo 前端网站: https://monday-open.github.io/mediatools/
echo.
pause
