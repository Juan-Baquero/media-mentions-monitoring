@echo off

setlocal

:: Initialize variables
set "adapter_found="
set "IP_ADDRESS="

:: Get the IP address of the Ethernet adapter Ethernet
for /f "tokens=*" %%i in ('ipconfig') do (
    echo %%i | findstr /i /c:"Ethernet adapter Ethernet" >nul && set "adapter_found=true"
    if defined adapter_found (
        echo %%i | findstr /i /c:"IPv4 Address" >nul && for /f "tokens=14 delims= " %%j in ("%%i") do set "IP_ADDRESS=%%j"
        if defined IP_ADDRESS goto :done
    )
)

:done


:: Check if cloudflared is running and terminate it
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I /N "cloudflared.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Stopping existing cloudflared process...
    taskkill /F /IM cloudflared.exe >nul
)

:: Start Cloudflare tunnel in the background and redirect output to a file
start /B cmd /c "cloudflared tunnel --url http://%IP_ADDRESS%:3000 > cloudflared_output.log 2>&1"

:: Wait for a few seconds to ensure some output is generated
timeout /t 5 /nobreak > nul

:: Extract the URL from cloudflared_output.log using PowerShell
for /f "tokens=*" %%i in ('powershell -Command "Select-String -Path 'cloudflared_output.log' -Pattern 'https.*\.com' | ForEach-Object { $_.Matches[0].Value }"') do set EXTRACTED_URL=%%i

:: Display the extracted URL
echo Extracted URL: %EXTRACTED_URL%

:: Set the VITE_API_LOCAL value
set "VITE_API_LOCAL=%EXTRACTED_URL%"

:: Authenticate with GitHub CLI using GH_TOKEN
echo %GH_TOKEN% | gh auth login --with-token

:: Set the repository variable using GitHub CLI
gh variable set VITE_API_LOCAL --body "%VITE_API_LOCAL%" --repo rpt-monitoreo/radio-alert

:: Dispatch the GitHub Actions workflow
gh workflow run deploy.ui.yml --repo rpt-monitoreo/radio-alert

endlocal

pnpm --prefix C:\Users\juanb\Documents\RADIO\radio-alert dev --filter=web-api