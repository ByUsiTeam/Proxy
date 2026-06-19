package main

import (
	"flag"
	"fmt"
	"os"
	"proxy-client-golang/pkg/logger"
	"proxy-client-golang/tcp"
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

func initLogger(level int) logger.Logger {
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

	zl := zerolog.New(output).With().Timestamp().Logger()

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

	return &logger.ZeroLogger{Logger: zl}
}

func main() {
	var (
		deviceId string
		logLevel int
		// SSL配置参数
		sslEnabled      bool
		sslCertFile     string
		sslKeyFile      string
		sslCAFile       string
		sslServerName   string
		sslInsecureSkip bool
	)

	flag.StringVar(&deviceId, "deviceId", "NO_ID", "设备ID")
	flag.IntVar(&logLevel, "logLevel", web.LogLevelInfo, "日志级别(0=Debug,1=Info,2=Warn,3=Error)")

	// SSL/TLS配置参数
	flag.BoolVar(&sslEnabled, "ssl", false, "启用SSL/TLS加密连接")
	flag.StringVar(&sslCertFile, "sslCert", "", "SSL客户端证书文件路径（PEM格式）")
	flag.StringVar(&sslKeyFile, "sslKey", "", "SSL客户端私钥文件路径（PEM格式）")
	flag.StringVar(&sslCAFile, "sslCA", "", "SSL CA证书文件路径（用于验证服务器证书）")
	flag.StringVar(&sslServerName, "sslServerName", "", "SSL服务器名称（SNI）")
	flag.BoolVar(&sslInsecureSkip, "sslInsecureSkip", false, "跳过SSL证书验证（仅用于测试）")

	flag.Parse()

	// 环境变量处理
	if deviceId == "NO_ID" {
		if envId := os.Getenv("deviceId"); envId != "" {
			deviceId = envId
		}
	}

	// 初始化SSL配置
	if sslEnabled || os.Getenv("SSL_ENABLED") == "true" {
		sslConfig := &tcp.SSLConfig{
			Enable:       sslEnabled || os.Getenv("SSL_ENABLED") == "true",
			CertFile:     getEnvOrFlag("SSL_CERT_FILE", sslCertFile),
			KeyFile:      getEnvOrFlag("SSL_KEY_FILE", sslKeyFile),
			CAFile:       getEnvOrFlag("SSL_CA_FILE", sslCAFile),
			ServerName:   getEnvOrFlag("SSL_SERVER_NAME", sslServerName),
			InsecureSkip: sslInsecureSkip || os.Getenv("SSL_INSECURE_SKIP") == "true",
		}
		tcp.SetSSLConfig(sslConfig)
	}

	// 初始化日志系统
	log := initLogger(logLevel)

	log.Infof("启动参数 deviceId=%s logLevel=%d", deviceId, logLevel)

	// 打印SSL配置状态
	if sslConfig := tcp.GetSSLConfig(); sslConfig != nil && sslConfig.Enable {
		log.Infof("SSL配置: 启用=%t, 证书=%s, CA=%s, 服务器名称=%s, 跳过验证=%t",
			sslConfig.Enable, sslConfig.CertFile, sslConfig.CAFile, sslConfig.ServerName, sslConfig.InsecureSkip)
	}

	web.InitCloudDevice("https://proxy.properos.cn", deviceId, logLevel, log)

	log.Infof("服务就绪 url=%s version=%s", "http://127.0.0.1:10240/", "16.0")

	web.StartWeb(0, "16.0", log)
}

// getEnvOrFlag 获取环境变量值，如果环境变量存在则优先使用
func getEnvOrFlag(envName, flagValue string) string {
	if envValue := os.Getenv(envName); envValue != "" {
		return envValue
	}
	return flagValue
}
