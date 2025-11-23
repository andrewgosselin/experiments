@echo off
setlocal enabledelayedexpansion

REM Enable ANSI color support (Windows 10+)
for /f %%A in ('echo prompt $E ^| cmd') do set ESC=%%A

REM Color definitions (ANSI escape codes)
set "RED=%ESC%[0;31m"
set "GREEN=%ESC%[0;32m"
set "BLUE=%ESC%[0;34m"
set "CYAN=%ESC%[0;36m"
set "YELLOW=%ESC%[1;33m"
set "NC=%ESC%[0m"

REM Function to draw cat with blinking eyes
goto :main

:draw_cat
set "blink=%~1"
if "%blink%"=="true" (
    echo %CYAN%  /\___/\
    echo  (  - -  )
    echo  (  =^=  )
    echo   (____)%NC%
) else (
    echo %CYAN%  /\___/\
    echo  (  o o  )
    echo  (  =^=  )
    echo   (____)%NC%
)
exit /b

:main
REM Clear screen
cls

REM Print header and cat
echo %BLUE%=========================================
echo     %YELLOW%Nori Playlist Fetcher%BLUE%
echo =========================================%NC%
echo.
call :draw_cat false
echo.
echo %GREEN%-----------------------------------------
echo Enter playlist URL:
echo -----------------------------------------%NC%

REM Prompt for playlist URL
set /p "playlist_url=> "

REM Check if URL was provided
if "!playlist_url!"=="" (
    echo %RED%Error: No URL provided%NC%
    exit /b 1
)

REM Print separator for log output
echo.
echo %GREEN%-----------------------------------------
echo Log Output:
echo -----------------------------------------%NC%

REM Install dependencies
cd src
if errorlevel 1 (
    echo %RED%Error: Could not change to src directory%NC%
    exit /b 1
)
call npm install
if errorlevel 1 (
    echo %RED%Error: npm install failed%NC%
    exit /b 1
)

REM Run the fetch command
call npm run fetch "!playlist_url!"
if errorlevel 1 (
    echo %RED%Error: npm run fetch failed%NC%
    exit /b 1
)

REM Copy song links to clipboard
if exist "song_links.txt" (
    echo.
    echo %GREEN%-----------------------------------------
    echo %YELLOW%Copying song links to clipboard...%NC%
    type song_links.txt | clip
    echo %GREEN%Done! Links are now in your clipboard.%NC%
) else (
    echo %RED%Warning: song_links.txt not found%NC%
)

REM Final cat blink
powershell -Command "Start-Sleep -Milliseconds 500"
call :draw_cat true
powershell -Command "Start-Sleep -Milliseconds 200"
call :draw_cat false

goto :eof
endlocal


