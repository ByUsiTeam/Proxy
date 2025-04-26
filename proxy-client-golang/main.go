package main

import (
	"flag"
	"fmt"
	"os"
	"proxy-client-golang/web"
	"time"

	"github.com/rs/zerolog"
)

const (
	LogLevelDebug = iota
	LogLevelInfo
	LogLevelWarn
	LogLevelError
)

func initLogger(level int) zerolog.Logger {
	output := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.DateTime,
		FormatLevel: func(i interface{}) string {
			var levelColor string
			switch i.(string) {
			case "debug":
				levelColor = "\x1b[36m" // Cyan
			case "info":
				levelColor = "\x1b[32m" // Green
			case "warn":
				levelColor = "\x1b[33m" // Yellow
			case "error":
				levelColor = "\x1b[31m" // Red
			default:
				levelColor = "\x1b[37m" // White
			}
			return fmt.Sprintf("%s%-5s\x1b[0m", levelColor, i)
		},
	}

	logger := zerolog.New(output).With().Timestamp().Logger()

	switch level {
	case LogLevelDebug:
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case LogLevelInfo:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	case LogLevelWarn:
		zerolog.SetGlobalLevel(zerolog.WarnLevel)
	case LogLevelError:
		zerolog.SetGlobalLevel(zerolog.ErrorLevel)
	}

	return logger
}

func main() {
	var (
		deviceId string
		logLevel int
	)

	flag.StringVar(&deviceId, "deviceId", "NO_ID", "设备ID")
	flag.IntVar(&logLevel, "logLevel", web.LogLevelInfo, "日志级别(0=Debug,1=Info,2=Warn,3=Error)")
	flag.Parse()

	// 环境变量处理
	if deviceId == "NO_ID" {
		if envId := os.Getenv("deviceId"); envId != "" {
			deviceId = envId
		}
	}

	// 初始化日志系统
	logger := initLogger(logLevel)
	
	// 使用示例
	logger.Info().
		Str("deviceId", deviceId).
		Int("logLevel", logLevel).
		Msg("启动参数")

	logger.Debug().
		Int64("timestamp", time.Now().Unix()).
		Int("goroutines", 15).
		Msg("调试信息示例")

	web.InitCloudDevice("http://proxy.byusi.cn:9090", deviceId, logLevel)
	
	logger.Info().
		Str("url", "http://127.0.0.1:10240/").
		Str("version", "15.4").
		Msg("服务就绪")
	
	web.StartWeb(0, "15.4")
}