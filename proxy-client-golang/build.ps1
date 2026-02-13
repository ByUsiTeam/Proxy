# Windows PowerShell 编译脚本
# 功能：交叉编译 proxy-client 到多个平台
# 用法：在 PowerShell 中右键“使用 PowerShell 运行”，或在终端中执行

# 清除编译后的内容
Write-Host "正在清理 build 目录..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force build\*
} else {
    New-Item -ItemType Directory -Path "build" -Force | Out-Null
}
Write-Host "清理完成" -ForegroundColor Green

# 编译 Windows AMD64
Write-Host "正在编译 Windows AMD64 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="windows"
$env:GOARCH="amd64"
go build -o build/proxy-client.exe main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 Windows ARM64
Write-Host "正在编译 Windows ARM64 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="windows"
$env:GOARCH="arm64"
go build -o build/proxy-client-arm64.exe main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 Linux AMD64
Write-Host "正在编译 Linux AMD64 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="linux"
$env:GOARCH="amd64"
go build -o build/proxy-client-amd64 main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 MacOS AMD64
Write-Host "正在编译 MacOS AMD64 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="darwin"
$env:GOARCH="amd64"
go build -o build/proxy-client-apple-amd64 main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 MacOS ARM64
Write-Host "正在编译 MacOS ARM64 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="darwin"
$env:GOARCH="arm64"
go build -o build/proxy-client-apple-arm64 main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 Linux ARM64
Write-Host "正在编译 Linux ARM64 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="linux"
$env:GOARCH="arm64"
go build -o build/proxy-client-arm64 main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 Linux ARMv7
Write-Host "正在编译 Linux ARMv7 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="linux"
$env:GOARCH="arm"
$env:GOARM="7"
go build -o build/proxy-client-armv7 main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 Linux Mipsle
Write-Host "正在编译 Linux Mipsle 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="linux"
$env:GOARCH="mipsle"
go build -o build/proxy-client-mips main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

# 编译 Android ARM64
Write-Host "正在编译 Android ARM64 版 Proxy 穿透客户端...." -ForegroundColor Cyan
$env:CGO_ENABLED=0
$env:GOOS="android"
$env:GOARCH="arm64"
go build -o build/proxy-client-android main.go
if ($LASTEXITCODE -eq 0) { Write-Host "编译成功" -ForegroundColor Green }

Write-Host "所有编译任务执行完毕！" -ForegroundColor Magenta