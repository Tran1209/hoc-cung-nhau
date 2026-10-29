@echo off
chcp 65001 > nul
echo ===================================================
echo   Đang khởi động Web Học Cùng Nhau 💕
echo ===================================================
echo.
if not exist node_modules (
    echo Đang cài đặt thư viện lần đầu, xin chờ chút...
    call npm install
)
echo.
echo Mở trình duyệt và truy cập vào link hiển thị bên dưới (thường là http://localhost:5173)
echo Để dừng web, nhấn Ctrl + C
echo ===================================================
call npm run dev
pause
