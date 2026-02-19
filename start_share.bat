@echo off
cd /d "%~dp0"
title Chat App Server
echo ========================================================
echo               Chat App Sharing Server
echo ========================================================
echo.
echo [INFO] Starting the server...
echo [INFO] Once started, look for the 'Network' URL below.
echo [INFO] Share that URL with your colleagues.
echo.
echo Stop the server by pressing Ctrl+C.
echo.
call npm run share
pause
