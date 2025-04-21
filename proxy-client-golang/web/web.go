package web

import (
	"embed"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	HpMessage "proxy-client-golang/hpMessage"
	"proxy-client-golang/tcp"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed *
var staticFs embed.FS

// 日志级别常量
const (
	LogLevelDebug = iota
	LogLevelInfo
	LogLevelWarn
	LogLevelError
)

// 全局日志级别
var logLevel = LogLevelInfo

// Logger 接口定义
type Logger interface {
	Debugf(format string, args ...interface{})
	Infof(format string, args ...interface{})
	Warnf(format string, args ...interface{})
	Errorf(format string, args ...interface{})
}

// 默认使用标准库的日志实现
type stdLogger struct{}

func (l *stdLogger) Debugf(format string, args ...interface{}) {
	if logLevel <= LogLevelDebug {
		log.Printf("[DEBUG] "+format, args...)
	}
}

func (l *stdLogger) Infof(format string, args ...interface{}) {
	if logLevel <= LogLevelInfo {
		log.Printf("[INFO] "+format, args...)
	}
}

func (l *stdLogger) Warnf(format string, args ...interface{}) {
	if logLevel <= LogLevelWarn {
		log.Printf("[WARN] "+format, args...)
	}
}

func (l *stdLogger) Errorf(format string, args ...interface{}) {
	if logLevel <= LogLevelError {
		log.Printf("[ERROR] "+format, args...)
	}
}

// 默认日志记录器
var logger Logger = &stdLogger{}

// 设置日志级别
func SetLogLevel(level int) {
	logLevel = level
}

// 设置自定义日志记录器
func SetLogger(l Logger) {
	logger = l
}

// 创建一个以域名为主的map
var ConnGroup = sync.Map{}

// 创建一个ws的链接map
var ConnWsGroup = sync.Map{}

type ServerInfo struct {
	Domain      string
	Server      string
	ProxyServer string
	Status      bool
}

type Log struct {
	Domain string
	Msg    string
}

type Res struct {
	Code int
	Msg  string
}

type DeviceInfo struct {
	Username   string `json:"username"`
	Password   string `json:"password"`
	UserHost   string `json:"userHost"`
	ServerHost string `json:"serverHost"`
	Type       string `json:"type"`
	Domain     string `json:"domain"`
	Port       string `json:"port"`
}

type DeviceData struct {
	Code int           `json:"code"`
	Msg  string        `json:"msg"`
	Data []*DeviceInfo `json:"data"`
}

type CoreVersion struct {
	Id            string `json:"id"`
	VersionCode   string `json:"versionCode"`
	UpdateContent string `json:"updateContent"`
	CreateTime    string `json:"createTime"`
}

type CoreData struct {
	Code int          `json:"code"`
	Msg  string       `json:"msg"`
	Data *CoreVersion `json:"data"`
}

var ApiUrl = ""
var CORE_VERSION = "1.0"
var deviceID = "NO_ID"

func Proxy(messageType HpMessage.HpMessage_MessageType, server_ip string, server_port int, username string, password string, domain string, remote_port int, ip string, port int) bool {
	_, ok := ConnGroup.Load(domain)
	if ok {
		logger.Warnf("域名 %s 已经存在，跳过创建", domain)
		return false
	}

	logger.Infof("创建新的代理连接: 类型=%s, 服务器=%s:%d, 域名=%s, 远程端口=%d, 目标=%s:%d",
		messageType, server_ip, server_port, domain, remote_port, ip, port)

	hpClient := tcp.NewHpClient(func(message string) {
		logger.Infof("[%s] %s", domain, message)
		wsSend(Log{Domain: domain, Msg: message})
	})
	hpClient.Connect(messageType, server_ip, server_port, username, password, domain, remote_port, ip, port)
	go func() {
		for {
			if hpClient.IsKill() {
				logger.Infof("代理连接 %s 已终止", domain)
				ConnGroup.Delete(domain)
				return
			}
			if !hpClient.GetStatus() {
				logger.Warnf("代理连接 %s 断开，尝试重连...", domain)
				hpClient.Connect(messageType, server_ip, server_port, username, password, domain, remote_port, ip, port)
				wsSend(Log{Domain: domain, Msg: "正在重连"})
			}
			time.Sleep(time.Duration(5) * time.Second)
		}
	}()
	ConnGroup.Store(domain, hpClient)
	logger.Infof("代理连接 %s 创建成功", domain)
	return true
}

func StartWeb(webPort int, coreVersion string) {
	CORE_VERSION = coreVersion
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard

	logger.Infof("启动Web服务，端口=%d，核心版本=%s", webPort, coreVersion)

	e := gin.Default()

	// 添加Gin日志中间件
	e.Use(func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		clientIP := c.ClientIP()
		method := c.Request.Method

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		logger.Infof("%s %s %s %d %v | %s",
			method,
			path,
			query,
			status,
			latency,
			clientIP,
		)
	})

	e.StaticFS("/static", http.FS(staticFs))

	/**
	添加穿透
	*/
	e.POST("/server/proxy", func(context *gin.Context) {
		logger.Debugf("收到添加穿透请求: %v", context.Request.PostForm)

		ip := context.PostForm("ip")
		port := context.PostForm("port")
		server_info := context.PostForm("server_info")
		username := context.PostForm("username")
		domain := context.PostForm("domain")
		remote_port := context.PostForm("remote_port")
		password := context.PostForm("password")
		proxyType := context.PostForm("type")
		messageType := HpMessage.HpMessage_TCP
		if proxyType == "TCP" {
			messageType = HpMessage.HpMessage_TCP
		} else if proxyType == "UDP" {
			messageType = HpMessage.HpMessage_UDP
		} else {
			messageType = HpMessage.HpMessage_TCP_UDP
		}

		if proxyType != "UDP" {
			if len(domain) == 0 {
				context.JSON(http.StatusOK, &Res{
					Code: -1,
					Msg:  "域名不能为空，如果还没有添加，请菜单里添加域名，然后刷新配置后重试",
				})
				return
			}
		} else {
			domain = "udp:" + ip + ":" + port
		}
		if len(server_info) == 0 {
			context.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "未选择穿透的服务器，请选择后重试",
			})
			return
		}

		if len(ip) == 0 || len(port) == 0 {
			context.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "要穿透的内网服务，未正确填写信息，请认真填写",
			})
			return
		}
		split := strings.Split(server_info, ":")
		ato1, _ := strconv.Atoi(split[1])
		ato2, _ := strconv.Atoi(remote_port)
		ato3, _ := strconv.Atoi(port)
		re := Proxy(messageType, split[0], ato1, username, password, domain, ato2, ip, ato3)
		if re {
			logger.Infof("成功添加穿透: domain=%s, server=%s, target=%s:%s", domain, server_info, ip, port)
			context.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "添加成功",
			})
		} else {
			logger.Warnf("添加穿透失败: domain=%s 可能已被使用", domain)
			context.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "添加失败！检查域名是否已经被使用。",
			})
		}
	})

	/**
	当前穿透列表
	*/
	e.GET("/server/info", func(context *gin.Context) {
		logger.Debugf("获取当前穿透列表请求")
		ret := make([]*ServerInfo, 0)
		ConnGroup.Range(func(key, value interface{}) bool {
			client := value.(*tcp.HpClient)
			ret = append(ret, &ServerInfo{
				Domain:      key.(string),
				Server:      client.GetServer(),
				ProxyServer: client.GetProxyServer(),
				Status:      client.GetStatus(),
			})
			return true
		})
		context.JSON(http.StatusOK, ret)
	})

	/**
	停止穿透服务
	*/
	e.GET("/server/stop", func(context *gin.Context) {
		domain := context.Query("domain")
		logger.Infof("收到停止穿透请求: domain=%s", domain)

		load, ok := ConnGroup.Load(domain)
		if ok {
			client := load.(*tcp.HpClient)
			client.Kill()
			ConnGroup.Delete(domain)
			logger.Infof("成功停止穿透: domain=%s", domain)
			context.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "成功",
			})
		} else {
			logger.Warnf("停止穿透失败: domain=%s 不存在", domain)
			context.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "失败",
			})
		}
	})

	/**
	内核版本
	*/
	e.GET("/core/version", func(context *gin.Context) {
		logger.Debugf("获取内核版本请求")
		resp, err := http.Get(ApiUrl + "/app/getCoreVersion")
		if err != nil {
			logger.Errorf("获取内核版本失败: %v", err)
		}
		defer func(Body io.ReadCloser) {
			err := Body.Close()
			if err != nil {
				logger.Errorf("关闭响应体失败: %v", err)
			}
		}(resp.Body)
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			logger.Errorf("读取内核版本响应失败: %v", err)
			context.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "检查更新失败",
			})
			return
		}
		data := &CoreData{}
		err = json.Unmarshal(body, data)
		if err != nil || data.Data == nil {
			logger.Errorf("解析内核版本数据失败: %v", err)
			context.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "检查更新失败",
			})
			return
		}
		//如果相等
		if strings.Compare(data.Data.VersionCode, CORE_VERSION) == 0 {
			logger.Infof("内核版本检查: 当前版本 %s 已是最新", CORE_VERSION)
			context.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "<font color='green'>不需要更新</font><br>当前版本:" + CORE_VERSION + "<br>你的Proxy内核已经是最新版",
			})
		} else {
			logger.Infof("内核版本检查: 当前版本 %s, 最新版本 %s", CORE_VERSION, data.Data.VersionCode)
			context.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "<font color='red'>需要更新</font><br>当前版本:" + CORE_VERSION + "<br>最新版本:" + data.Data.VersionCode + "<br>更新时间:" + data.Data.CreateTime + "<br>更新内容:" + data.Data.UpdateContent,
			})
		}
	})

	/**
	查询设备ID
	*/
	e.GET("/device/info", func(context *gin.Context) {
		logger.Debugf("查询设备ID请求")
		context.JSON(http.StatusOK, deviceID)
	})

	/**
	网页端请求前缀配置
	*/
	e.GET("/api.js", func(context *gin.Context) {
		logger.Debugf("获取API配置请求")
		context.String(http.StatusOK, "var apiAddress = \"/hp\"")
	})
	/**
	反向代理，前缀解析然后反向代理
	*/
	e.Any("/hp/*url", func(c *gin.Context) {
		logger.Debugf("反向代理请求: %s", c.Param("url"))
		remote, err := url.Parse(ApiUrl)
		if err != nil {
			logger.Errorf("解析API URL失败: %v", err)
			panic(err)
		}
		proxy := httputil.NewSingleHostReverseProxy(remote)
		proxy.Director = func(req *http.Request) {
			req.Header = c.Request.Header
			req.Host = remote.Host
			req.URL.Scheme = remote.Scheme
			req.URL.Host = remote.Host
			req.URL.Path = c.Param("url")
		}
		proxy.ServeHTTP(c.Writer, c.Request)
	})

	e.GET("/", func(context *gin.Context) {
		logger.Debugf("根路径请求，重定向到登录页")
		context.Redirect(http.StatusMovedPermanently, "/static/login.html")
	})

	e.GET("/ws", ws)
	if webPort <= 0 {
		webPort = 10240
	}
	logger.Infof("Web服务监听端口: %d", webPort)
	err := e.Run(":" + strconv.Itoa(webPort))
	if err != nil {
		logger.Errorf("启动Web服务失败: %v", err)
	}
}

var upGrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsSend(msg Log) {
	defer func() {
		if r := recover(); r != nil {
			logger.Errorf("wsSend panic: %v", r)
		}
	}()
	ConnWsGroup.Range(func(key, value interface{}) bool {
		WS := key.(*websocket.Conn)
		err := WS.WriteJSON(msg)
		if err != nil {
			logger.Errorf("发送WebSocket消息失败: %v", err)
			return false
		}
		return true
	})
}

func InitCloudDevice(apiAddress string, deviceId string, level int) {
	SetLogLevel(level)
	ApiUrl = apiAddress
	defer func() {
		if err := recover(); err != nil {
			logger.Errorf("云端资源读取失败: %v", err)
		}
	}()
	if deviceId == "NO_ID" {
		logger.Warnf("未获取到设备ID，不能加载云端资源")
		return
	} else {
		//校验设备ID
		matched, _ := regexp.MatchString("^[0-9a-zA-Z]+$", deviceId)
		if !matched || !(len(deviceId) >= 10 && len(deviceId) <= 36) {
			logger.Errorf("设备ID无效: %s (只能是数字和字母组成同时大于10-36位)", deviceId)
			return
		}
	}
	deviceID = deviceId
	logger.Infof("初始化云设备连接，API地址=%s，设备ID=%s", apiAddress, deviceId)
	resp, err := http.Get(ApiUrl + "/config/listDevice?deviceId=" + deviceId)
	if err != nil {
		logger.Errorf("获取设备配置失败: %v", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			logger.Errorf("关闭响应体失败: %v", err)
		}
	}(resp.Body)
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Errorf("读取设备配置响应失败: %v", err)
	}
	data := &DeviceData{}
	err = json.Unmarshal(body, data)
	if err == nil {
		//启动穿透的配置调用
		for i := range data.Data {
			info := data.Data[i]
			var hpType HpMessage.HpMessage_MessageType
			if info.Type == "TCP" {
				hpType = HpMessage.HpMessage_TCP
			} else if info.Type == "UDP" {
				hpType = HpMessage.HpMessage_UDP
			} else if info.Type == "TCP_UDP" {
				hpType = HpMessage.HpMessage_TCP_UDP
			} else {
				logger.Errorf("穿透类型未知: %s", info.Type)
				return
			}

			split1 := strings.Split(info.ServerHost, ":")
			serverIp := split1[0]
			serverPort, _ := strconv.Atoi(split1[1])
			port, _ := strconv.Atoi(info.Port)

			split2 := strings.Split(info.UserHost, ":")
			userIp := split2[0]
			userPort, _ := strconv.Atoi(split2[1])
			re := Proxy(hpType, serverIp, serverPort, info.Username, info.Password, info.Domain, port, userIp, userPort)
			if re {
				logger.Infof("内网服务启动成功: %s -> %s", info.UserHost, info.Domain)
			} else {
				logger.Errorf("内网服务启动失败: %s -> %s", info.UserHost, info.Domain)
			}
		}
	} else {
		logger.Errorf("解析设备配置失败: %v", err)
	}
}

func ws(c *gin.Context) {
	//升级get请求为webSocket协议
	ws, err := upGrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logger.Errorf("WebSocket升级失败: %v", err)
		return
	}
	logger.Infof("新的WebSocket连接建立")
	ConnWsGroup.Store(ws, nil)
	defer func() {
		ConnWsGroup.Delete(ws)
		ws.Close()
		logger.Infof("WebSocket连接关闭")
	}()
	for {
		//读取ws中的数据
		mt, message, err := ws.ReadMessage()
		if err != nil {
			logger.Errorf("读取WebSocket消息失败: %v", err)
			break
		}
		if string(message) == "ping" {
			message = []byte("pong")
		}
		//写入ws数据
		err = ws.WriteMessage(mt, message)
		if err != nil {
			logger.Errorf("写入WebSocket消息失败: %v", err)
			break
		}
	}
}