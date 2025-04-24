package main

import (
	"flag"
	"proxy-client-golang/web"
	"log"
	"os"
)

func main() {
	var deviceId string
	var logLevel int

	// 命令行参数模式
	flag.StringVar(&deviceId, "deviceId", "NO_ID", "设备ID")
	flag.IntVar(&logLevel, "logLevel", web.LogLevelInfo, "日志级别(0=Debug,1=Info,2=Warn,3=Error)")
	flag.Parse()

	// 默认命令行参数大于环境变量参数
	e := os.Getenv("deviceId")
	if deviceId == "NO_ID" && e != "" {
		deviceId = e
	}

	log.Printf("启动参数: deviceId=%s, logLevel=%d", deviceId, logLevel)
	web.InitCloudDevice("http://proxy.byusi.cn:9090", deviceId, logLevel)
	log.Printf("请访问 http://127.0.0.1:10240/ 进行穿透配置")
	web.StartWeb(0, "15.4")
}