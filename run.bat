@echo off
title Loy Krathong 3D Festival Server
echo ========================================================
echo   Loy Krathong 3D Festival - Starting Local Server...
echo ========================================================
echo Opening http://localhost:8088 in your default browser...
start http://localhost:8088
powershell -ExecutionPolicy Bypass -File .\serve.ps1
pause
