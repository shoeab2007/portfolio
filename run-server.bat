@echo off
title Shoeab Shaikh - Lead Art Director & Visual Strategist Portfolio Server
echo =====================================================================
echo  Starting Shoeab Shaikh Kinetic Creative Portfolio Server
echo  Powered by React 18, Tailwind CSS, Matter.js Physics, and Python
echo =====================================================================
echo.
echo  Local Server Running: http://localhost:8000
echo.
echo  Close this window to stop the server.
echo.
python server.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo Server failed to start. Make sure Python is in your PATH.
    pause
)
