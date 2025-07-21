package web

import (
	"embed"
	"encoding/json"
	_"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	HpMessage "proxy-client-golang/hpMessage"
	"proxy-client-golang/pkg/logger"
	"proxy-client-golang/tcp"
	"io"
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

const (
	LogLevelDebug = iota
	LogLevelInfo
	LogLevelWarn
	LogLevelError
)

var (
	logLevel     = LogLevelInfo
	log          logger.Logger
	ApiUrl       = ""
	deviceID     = "NO_ID"
	CORE_VERSION = "1.0"
)

var (
	ConnGroup   = sync.Map{}
	ConnWsGroup = sync.Map{}
	upGrader    = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

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

func SetLogLevel(level int) {
	logLevel = level
}

func SetLogger(l logger.Logger) {
	log = l
}

func wsSend(msg Log) {
	defer func() {
		if r := recover(); r != nil {
			log.Errorf("wsSend panic: %v", r)
		}
	}()

	ConnWsGroup.Range(func(key, value interface{}) bool {
		WS := key.(*websocket.Conn)
		err := WS.WriteJSON(msg)
		if err != nil {
			log.Errorf("发送WebSocket消息失败: %v", err)
			return false
		}
		return true
	})
}

func Proxy(messageType HpMessage.HpMessage_MessageType, server_ip string, server_port int, username string, password string, domain string, remote_port int, ip string, port int) bool {
	_, ok := ConnGroup.Load(domain)
	if ok {
		log.Warnf("域名 %s 已经存在，跳过创建", domain)
		return false
	}

	log.Infof("创建新的代理连接: 类型=%s, 服务器=%s:%d, 域名=%s, 远程端口=%d, 目标=%s:%d",
		messageType, server_ip, server_port, domain, remote_port, ip, port)

	hpClient := tcp.NewHpClient(func(message string) {
		log.Infof("[%s] %s", domain, message)
		wsSend(Log{Domain: domain, Msg: message})
	})
	hpClient.Connect(messageType, server_ip, server_port, username, password, domain, remote_port, ip, port)
	go func() {
		for {
			if hpClient.IsKill() {
				log.Infof("代理连接 %s 已终止", domain)
				ConnGroup.Delete(domain)
				return
			}
			if !hpClient.GetStatus() {
				log.Warnf("代理连接 %s 断开，尝试重连...", domain)
				hpClient.Connect(messageType, server_ip, server_port, username, password, domain, remote_port, ip, port)
				wsSend(Log{Domain: domain, Msg: "正在重连"})
			}
			time.Sleep(5 * time.Second)
		}
	}()
	ConnGroup.Store(domain, hpClient)
	log.Infof("代理连接 %s 创建成功", domain)
	return true
}

func StartWeb(webPort int, coreVersion string, logger logger.Logger) {
	SetLogger(logger)
	CORE_VERSION = coreVersion
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard

	log.Infof("启动Web服务，端口=%d，核心版本=%s", webPort, coreVersion)

	e := gin.Default()

	e.Use(func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		clientIP := c.ClientIP()
		method := c.Request.Method

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		log.Infof("%s %s %s %d %v | %s",
			method,
			path,
			query,
			status,
			latency,
			clientIP,
		)
	})

	e.StaticFS("/static", http.FS(staticFs))

	e.POST("/server/proxy", func(c *gin.Context) {
		log.Debugf("收到添加穿透请求: %v", c.Request.PostForm)

		ip := c.PostForm("ip")
		port := c.PostForm("port")
		server_info := c.PostForm("server_info")
		username := c.PostForm("username")
		domain := c.PostForm("domain")
		remote_port := c.PostForm("remote_port")
		password := c.PostForm("password")
		proxyType := c.PostForm("type")
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
				c.JSON(http.StatusOK, &Res{
					Code: -1,
					Msg:  "域名不能为空，如果还没有添加，请菜单里添加域名，然后刷新配置后重试",
				})
				return
			}
		} else {
			domain = "udp:" + ip + ":" + port
		}
		if len(server_info) == 0 {
			c.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "未选择穿透的服务器，请选择后重试",
			})
			return
		}

		if len(ip) == 0 || len(port) == 0 {
			c.JSON(http.StatusOK, &Res{
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
			log.Infof("成功添加穿透: domain=%s, server=%s, target=%s:%s", domain, server_info, ip, port)
			c.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "添加成功",
			})
		} else {
			log.Warnf("添加穿透失败: domain=%s 可能已被使用", domain)
			c.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "添加失败！检查域名是否已经被使用。",
			})
		}
	})

	e.GET("/server/info", func(c *gin.Context) {
		log.Debugf("获取当前穿透列表请求")
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
		c.JSON(http.StatusOK, ret)
	})

	e.GET("/server/stop", func(c *gin.Context) {
		domain := c.Query("domain")
		log.Infof("收到停止穿透请求: domain=%s", domain)

		load, ok := ConnGroup.Load(domain)
		if ok {
			client := load.(*tcp.HpClient)
			client.Kill()
			ConnGroup.Delete(domain)
			log.Infof("成功停止穿透: domain=%s", domain)
			c.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "成功",
			})
		} else {
			log.Warnf("停止穿透失败: domain=%s 不存在", domain)
			c.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "失败",
			})
		}
	})

	e.GET("/core/version", func(c *gin.Context) {
		log.Debugf("获取内核版本请求")
		resp, err := http.Get(ApiUrl + "/app/getCoreVersion")
		if err != nil {
			log.Errorf("获取内核版本失败: %v", err)
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Errorf("读取内核版本响应失败: %v", err)
			c.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "检查更新失败",
			})
			return
		}
		data := &CoreData{}
		err = json.Unmarshal(body, data)
		if err != nil || data.Data == nil {
			log.Errorf("解析内核版本数据失败: %v", err)
			c.JSON(http.StatusOK, &Res{
				Code: -1,
				Msg:  "检查更新失败",
			})
			return
		}
		if strings.Compare(data.Data.VersionCode, CORE_VERSION) == 0 {
			log.Infof("内核版本检查: 当前版本 %s 已是最新", CORE_VERSION)
			c.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "<font color='green'>不需要更新</font><br>当前版本:" + CORE_VERSION + "<br>你的Proxy内核已经是最新版",
			})
		} else {
			log.Infof("内核版本检查: 当前版本 %s, 最新版本 %s", CORE_VERSION, data.Data.VersionCode)
			c.JSON(http.StatusOK, &Res{
				Code: 200,
				Msg:  "<font color='red'>需要更新</font><br>当前版本:" + CORE_VERSION + "<br>最新版本:" + data.Data.VersionCode + "<br>更新时间:" + data.Data.CreateTime + "<br>更新内容:" + data.Data.UpdateContent,
			})
		}
	})

	e.GET("/device/info", func(c *gin.Context) {
		log.Debugf("查询设备ID请求")
		c.JSON(http.StatusOK, deviceID)
	})

	e.GET("/api.js", func(c *gin.Context) {
		log.Debugf("获取API配置请求")
		c.String(http.StatusOK, "var apiAddress = \"/hp\"")
	})

	e.Any("/hp/*url", func(c *gin.Context) {
		log.Debugf("反向代理请求: %s", c.Param("url"))
		remote, err := url.Parse(ApiUrl)
		if err != nil {
			log.Errorf("解析API URL失败: %v", err)
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

	e.GET("/", func(c *gin.Context) {
		log.Debugf("根路径请求，重定向到登录页")
		c.Redirect(http.StatusMovedPermanently, "/static/login.html")
	})

	e.GET("/ws", func(c *gin.Context) {
		ws, err := upGrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Errorf("WebSocket升级失败: %v", err)
			return
		}
		log.Infof("新的WebSocket连接建立")
		ConnWsGroup.Store(ws, nil)
		defer func() {
			ConnWsGroup.Delete(ws)
			ws.Close()
			log.Infof("WebSocket连接关闭")
		}()
		for {
			mt, message, err := ws.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Errorf("WebSocket读取错误: %v", err)
				}
				break
			}
			if string(message) == "ping" {
				message = []byte("pong")
			}
			err = ws.WriteMessage(mt, message)
			if err != nil {
				log.Errorf("WebSocket写入错误: %v", err)
				break
			}
		}
	})

	if webPort <= 0 {
		webPort = 10240
	}
	log.Infof("Web服务监听端口: %d", webPort)
	err := e.Run(":" + strconv.Itoa(webPort))
	if err != nil {
		log.Errorf("启动Web服务失败: %v", err)
	}
}

func InitCloudDevice(apiAddress string, deviceId string, level int, logger logger.Logger) {
	SetLogger(logger)
	SetLogLevel(level)
	ApiUrl = apiAddress
	defer func() {
		if err := recover(); err != nil {
			log.Errorf("云端资源读取失败: %v", err)
		}
	}()
	if deviceId == "NO_ID" {
		log.Warnf("未获取到设备ID，不能加载云端资源")
		return
	} else {
		matched, _ := regexp.MatchString("^[0-9a-zA-Z]+$", deviceId)
		if !matched || !(len(deviceId) >= 10 && len(deviceId) <= 36) {
			log.Errorf("设备ID无效: %s (只能是数字和字母组成同时大于10-36位)", deviceId)
			return
		}
	}
	deviceID = deviceId
	log.Infof("初始化云设备连接，API地址=%s，设备ID=%s", apiAddress, deviceId)
	resp, err := http.Get(ApiUrl + "/config/listDevice?deviceId=" + deviceId)
	if err != nil {
		log.Errorf("获取设备配置失败: %v", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("读取设备配置响应失败: %v", err)
	}
	data := &DeviceData{}
	err = json.Unmarshal(body, data)
	if err == nil {
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
				log.Errorf("穿透类型未知: %s", info.Type)
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
				log.Infof("内网服务启动成功: %s -> %s", info.UserHost, info.Domain)
			} else {
				log.Errorf("内网服务启动失败: %s -> %s", info.UserHost, info.Domain)
			}
		}
	} else {
		log.Errorf("解析设备配置失败: %v", err)
	}
}