@echo off
setlocal enabledelayedexpansion

:: 设置颜色
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
    set "DEL=%%a"
)

:: 定义颜色
set ESC=%DEL:~-2%
set RESET=%ESC%[0m
set BOLD=%ESC%[1m
set RED=%ESC%[31m
set GREEN=%ESC%[32m
set YELLOW=%ESC%[33m
set BLUE=%ESC%[34m
set MAGENTA=%ESC%[35m
set CYAN=%ESC%[36m
set WHITE=%ESC%[37m
set BG_RED=%ESC%[41m

:: 检查管理员权限
NET SESSION >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%需要管理员权限运行此脚本。%RESET%
    echo 请右键点击脚本，选择"以管理员身份运行"。
    pause
    exit /b 1
)

:: 设置变量
set INSTALL_DIR=C:\ByUsi\App\Proxy\Client
set AMD64_URL=https://gitee.com/byusi/proxy/releases/download/15.4.2/proxy-client.exe
set ARM64_URL=https://gitee.com/byusi/proxy/releases/download/15.4.2/proxy-client-arm64.exe
set PROXY_EXE=proxy.exe  :: 修改为proxy.exe

:: 模拟 whiptail 的 yes/no 对话框
:show_install_dialog
cls
echo %BOLD%%BLUE%=============================================%RESET%
echo %BOLD%%WHITE%  Proxy-Client Windows 客户端安装程序 %RESET%
echo %BOLD%%BLUE%=============================================%RESET%
echo.
echo 此脚本将安装 Proxy-Client Windows 客户端到您的系统。
echo.
echo 默认安装目录: %INSTALL_DIR%
echo.
echo %YELLOW%是否要继续安装?%RESET%
echo.
echo %GREEN% 1. 是 (使用默认目录安装)%RESET%
echo %GREEN% 2. 是 (选择自定义目录)%RESET%
echo %RED% 3. 否 (退出安装)%RESET%
echo.
set /p choice=请选择 (1/2/3): 

if "%choice%"=="1" goto check_architecture
if "%choice%"=="2" goto custom_dir
if "%choice%"=="3" goto exit_script
goto show_install_dialog

:custom_dir
cls
echo %BOLD%%BLUE%=============================================%RESET%
echo %BOLD%%WHITE%  选择安装目录 %RESET%
echo %BOLD%%BLUE%=============================================%RESET%
echo.
echo 请输入安装目录路径 (例如: D:\Proxy\Client)
echo.
set /p INSTALL_DIR=安装目录: 
if "%INSTALL_DIR%"=="" (
    echo %RED%错误: 安装目录不能为空%RESET%
    pause
    goto custom_dir
)

:check_architecture
cls
echo %BOLD%%BLUE%=============================================%RESET%
echo %BOLD%%WHITE%  选择系统架构 %RESET%
echo %BOLD%%BLUE%=============================================%RESET%
echo.
echo 请选择您的系统架构:
echo.
echo %GREEN% 1. AMD64 (大多数 Intel/AMD 64位系统)%RESET%
echo %GREEN% 2. ARM64 (ARM 64位系统)%RESET%
echo.
set /p arch=请选择 (1/2): 

if "%arch%"=="1" (
    set DOWNLOAD_URL=%AMD64_URL%
) else if "%arch%"=="2" (
    set DOWNLOAD_URL=%ARM64_URL%
) else (
    echo %RED%无效选择，请重新输入%RESET%
    pause
    goto check_architecture
)

:: 创建安装目录
echo.
echo %YELLOW%正在创建安装目录...%RESET%
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%" >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%无法创建安装目录: %INSTALL_DIR%%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%安装目录创建成功: %INSTALL_DIR%%RESET%
) else (
    echo %YELLOW%安装目录已存在: %INSTALL_DIR%%RESET%
)

:: 下载并重命名客户端
echo.
echo %YELLOW%正在下载并安装 Proxy-Client...%RESET%
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%INSTALL_DIR%\%PROXY_EXE%')"
if %ERRORLEVEL% NEQ 0 (
    echo %RED%下载失败，请检查网络连接或URL是否有效%RESET%
    pause
    exit /b 1
)
echo %GREEN%下载完成，文件已保存为: %PROXY_EXE%%RESET%

:: 添加到系统 PATH (系统级)
echo.
echo %YELLOW%正在添加到系统 PATH (系统级)...%RESET%
for /F "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path ^| findstr /i "Path"') do (
    set "CURRENT_PATH=%%B"
)

echo %YELLOW%当前系统 PATH: %CURRENT_PATH%%RESET%

:: 检查是否已包含安装目录
echo %INSTALL_DIR%| find /i "%CURRENT_PATH%" >nul
if %ERRORLEVEL% EQU 0 (
    echo %YELLOW%安装目录已在系统 PATH 中%RESET%
) else (
    setx PATH "%CURRENT_PATH%;%INSTALL_DIR%" /M >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%错误: 无法更新系统 PATH%RESET%
    ) else (
        echo %GREEN%已成功添加到系统 PATH%RESET%
    )
)

:: 创建桌面快捷方式
echo.
echo %YELLOW%正在创建桌面快捷方式...%RESET%
set SHORTCUT="%USERPROFILE%\Desktop\Proxy Client.lnk"
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut(%SHORTCUT%); $Shortcut.TargetPath = '%INSTALL_DIR%\%PROXY_EXE%'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()"
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%警告: 无法创建桌面快捷方式%RESET%
) else (
    echo %GREEN%桌面快捷方式创建成功%RESET%
)

:: 安装完成
echo.
echo %BOLD%%GREEN%=============================================%RESET%
echo %BOLD%%WHITE%  Proxy-Client 安装成功! %RESET%
echo %BOLD%%GREEN%=============================================%RESET%
echo.
echo 安装目录: %INSTALL_DIR%
echo 可执行文件: %PROXY_EXE%
echo.
echo 您可以通过以下方式启动:
echo 1. 双击桌面快捷方式
echo 2. 在命令提示符中输入 "proxy"
echo.
echo %YELLOW%注意: 新 PATH 设置可能需要重新启动命令提示符或系统才能生效%RESET%
echo.
pause

:exit_script
exit /b 0