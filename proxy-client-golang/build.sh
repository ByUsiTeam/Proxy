# 清除编译后的内容
rm -rvf build/*

# 编译
echo "正在编译Windows的AMD64版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=windows
export GOARCH=amd64
go build -o build/proxy-client_v$1.exe main.go
echo "编译成功"

echo "正在编译Windows的ARM64版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=windows
export GOARCH=arm64
go build -o build/proxy-client-arm64_v$1.exe main.go
echo "编译成功"

echo "正在编译Linux的AMD64版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=linux
export GOARCH=amd64
go build -o build/proxy-client-amd64_v$1 main.go
echo "编译成功"

echo "正在编译MacOS的AMD64版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=darwin
export GOARCH=amd64
go build -o build/proxy-client-apple-amd64_v$1 main.go
echo "编译成功"

echo "正在编译MacOS的ARM64版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=darwin
export GOARCH=arm64
go build -o build/proxy-client-apple-arm64_v$1 main.go
echo "编译成功"

echo "正在编译Linux的ARM64版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=linux
export GOARCH=arm64
go build -o build/proxy-client-arm64_v$1 main.go
echo "编译成功"

echo "正在编译Linux的ARMv7版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=linux
export GOARCH=arm
export GOARM=7
go build -o build/proxy-client-armv7_v$1 main.go
echo "编译成功"

echo "正在编译Linux的Mipsle版Proxy穿透客户端...."
export CGO_ENABLED=0
export GOOS=linux
export GOARCH=mipsle
go build -o build/proxy-client-mips_v$1 main.go
echo "编译成功"

echo "正在编译Android的ARM64版Proxy穿透...."
export CGO_ENABLED=0
export GOOS=android
export GOARCH=arm64
go build -o build/proxy-client-android_v$1 main.go
echo "编译成功"
echo "编译完成✅"