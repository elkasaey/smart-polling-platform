@echo off
echo Starting Smart Polling Platform...
echo.

echo Starting Backend Server...
cd backend
start "Django Backend" cmd /k "python manage.py runserver"
cd ..

echo.
echo Starting Frontend Server...
cd frontend
start "React Frontend" cmd /k "npm start"
cd ..

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
