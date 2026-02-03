@echo off
title Hubbe Web Panel
color 0b
cls
echo =======================================================
echo          HUBBE WEB PANEL BASLATILIYOR
echo =======================================================
echo.
echo Onceki sunucu ve Node surecleri temizleniyor...
echo.

:: Port 3000'i temizle
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Calisan Node sureclerini temizle (opsiyonel ama cakismalari onler)
taskkill /f /im node.exe >nul 2>&1

echo.
echo Gerekli paketler kontrol ediliyor ve sunucu aciliyor...
echo.
echo Tarayiciniz 10 saniye icinde acilacak...
echo.
echo Lutfen bu siyah pencereyi KAPATMAYIN.
echo.

:: 10 Saniye bekle
timeout /t 10 /nobreak >nul
start "" "http://localhost:3000"

:: Sunucuyu baslat
call npm run dev

:: Eger sunucu duserse pencereyi acik tut
echo.
echo =======================================================
echo HATA: Sunucu kapandi veya bir hata olustu.
echo Lutfen yukaridaki hatayi kontrol edin.
echo =======================================================
pause
