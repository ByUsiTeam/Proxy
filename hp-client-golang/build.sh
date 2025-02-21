export CGO_ENABLED=0
export GOOS=windows
export GOARCH=amd64
go build -o proxy-client.exe main.go

export CGO_ENABLED=0
export GOOS=linux
export GOARCH=amd64
go build -o proxy-client-amd64 main.go

export CGO_ENABLED=0
export GOOS=darwin
export GOARCH=amd64
go build -o proxy-client-apple-amd64 main.go

export CGO_ENABLED=0
export GOOS=darwin
export GOARCH=arm64
go build -o proxy-client-apple-arm64 main.go

export CGO_ENABLED=0
export GOOS=linux
export GOARCH=arm64
go build -o proxy-client-arm64 main.go

export CGO_ENABLED=0
export GOOS=linux
export GOARCH=arm
export GOARM=7
go build -o proxy-client-armv7 main.go

export CGO_ENABLED=0
export GOOS=linux
export GOARCH=mipsle
go build -o proxy-client-mips main.go
