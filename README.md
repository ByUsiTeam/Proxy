# Proxy穿透
- [编译教程](Build.md)
- 加入官方群聊 [Telegram](https://t.me/+1_rc1TbWydVkN2I1) [QQ群](mqqapi://card/show_pslcard?src_type=internal&version=1&uin=822726278&card_type=group&source=qrcode)
- 访客记录
  > ![访客记录](https://count.kjchmc.cn/get/@ByUsi-Proxy-master?theme=rule34)

#### 介绍
我们采用的是数据转发实现 稳定性可靠性是有保证的即便是极端的环境只要能上网就能实现穿透。
我们支持TCP和UDP协议，针对 http/https ws/wss 协议做了大量的优化工作可以更加灵活的控制。让用户使用更佳舒服简单。

#### 源项目
[![HServer/hp-内网穿透](https://gitee.com/HServer/hp/widgets/widget_card.svg?colors=4183c4,ffffff,ffffff,e3e9ed,666666,9b9b9b)](https://gitee.com/HServer/hp)

#### 多仓库
- Gitee：
  ```url
  https://gitee.com/byusi/proxy
  ```
- GitHub：
  ```url
  https://github.com/ByUsiTeam/Proxy
  ```

### **Termux**和**Linux**快速部署脚本
  - Gitee
  ```bash
  bash -c "$(curl -sSL https://gitee.com/byusi/proxy/raw/master/shell/install2.sh)"
  ```
  - GitHub
  ```bash
  bash -c "$(curl -sSL https://raw.githubusercontent.com/ByUsiTeam/Proxy/master/shell/install2.sh)"
  ```

### **Termux**和**Linux**快速解除部署脚本
  - Gitee
  ```bash
  bash -c "$(curl -sSL https://gitee.com/byusi/proxy/raw/master/shell/uninstall.sh)"
  ```

  - GitHub
  ```bash
  bash -c "(curl -sSL https://raw.githubusercontent.com/ByUsiTeam/Proxy/master/shell/uninstall.sh)"
  ```

### 原理图
<img src="https://gitee.com/byusi/proxy/raw/master/doc/img_1.png" width="500" />


## 云后台管理web
<img src="https://gitee.com/byusi/proxy/raw/master/doc/img_3.png" width="500" />

### 安卓客服端（暂不支持）
<img src="https://gitee.com/byusi/proxy/raw/master/doc/d.jpg" width="500" />
<img src="https://gitee.com/byusi/proxy/raw/master/doc/e.jpg" width="500" />
<img src="https://gitee.com/byusi/proxy/raw/master/doc/f.jpg" width="500" />

### Golang客服端
为了跨平台我们提供golang的实现
<img src="https://gitee.com/byusi/proxy/raw/master/doc/Screenshot_20250422032415.png" width="500" />

# TREE
```txt
./
├── Build.md
├── LICENSE
├── README.md
├── doc/
│ ├── Screenshot_20250422032415.png
│ ├── c.png
│ ├── d.jpg
│ ├── e.jpg
│ ├── f.jpg
│ ├── img_1.png
│ ├── img_2.png
│ ├── img_3.png
│ └── log.png
├── fz.txt
├── hp-proxy/
│ ├── src/
│ │ └── main/
│ │     └── resources/
│ │         └── static/
│ │             └── index/
│ └── target/
│     └── classes/
│         └── static/
│             └── index/
│                 └── image/
├── hp-server/
│ └── target/
│     └── classes/
│         └── static/
│             └── img/
├── pom.xml
├── proto/
│ ├── HpMessage/
│ │ └── HpMessage.pb.go
│ ├── HpMessage.proto
│ ├── gen.bat
│ ├── net/
│ │ └── hserver/
│ │     └── hp/
│ │         └── common/
│ │             └── protocol/
│ │                 └── HpMessageData.java
│ ├── protoc-gen-go.exe
│ └── protoc.exe
├── proxy-client-golang/
│ ├── Protol/
│ │ └── Protol.go
│ ├── android/
│ │ ├── android.go
│ │ └── buid_android_aar.sh
│ ├── build/
│ ├── build.sh
│ ├── gen_logger.go
│ ├── go.mod
│ ├── go.sum
│ ├── hpMessage/
│ │ └── hpMessage.pb.go
│ ├── main.go
│ ├── main.go.bak
│ ├── pkg/
│ │ └── logger/
│ │     └── logger.go
│ ├── proxy-client-golang.zip
│ ├── tcp/
│ │ ├── Handler.go
│ │ ├── HpClient.go
│ │ ├── HpClientHandler.go
│ │ ├── LocalProxyHandler.go
│ │ ├── LocalProxyUdpHandler.go
│ │ ├── TcpConnection.go
│ │ └── UdpConnection.go
│ ├── test.go
│ └── web/
│     ├── autoproxy.html
│     ├── center.html
│     ├── common/
│     │ ├── css/
│     │ │ ├── index.css
│     │ │ ├── mdui.css
│     │ │ ├── mdui.css.map
│     │ │ ├── mdui.min.css
│     │ │ ├── mdui.min.css.map
│     │ │ ├── paging.css
│     │ │ ├── proxy-beauty.css
│     │ │ └── style.css
│     │ ├── fonts/
│     │ │ └── roboto/
│     │ │     ├── LICENSE.txt
│     │ │     ├── Roboto-Black.woff
│     │ │     ├── Roboto-Black.woff2
│     │ │     ├── Roboto-BlackItalic.woff
│     │ │     ├── Roboto-BlackItalic.woff2
│     │ │     ├── Roboto-Bold.woff
│     │ │     ├── Roboto-Bold.woff2
│     │ │     ├── Roboto-BoldItalic.woff
│     │ │     ├── Roboto-BoldItalic.woff2
│     │ │     ├── Roboto-Light.woff
│     │ │     ├── Roboto-Light.woff2
│     │ │     ├── Roboto-LightItalic.woff
│     │ │     ├── Roboto-LightItalic.woff2
│     │ │     ├── Roboto-Medium.woff
│     │ │     ├── Roboto-Medium.woff2
│     │ │     ├── Roboto-MediumItalic.woff
│     │ │     ├── Roboto-MediumItalic.woff2
│     │ │     ├── Roboto-Regular.woff
│     │ │     ├── Roboto-Regular.woff2
│     │ │     ├── Roboto-RegularItalic.woff
│     │ │     ├── Roboto-RegularItalic.woff2
│     │ │     ├── Roboto-Thin.woff
│     │ │     ├── Roboto-Thin.woff2
│     │ │     ├── Roboto-ThinItalic.woff
│     │ │     └── Roboto-ThinItalic.woff2
│     │ ├── icons/
│     │ │ └── material-icons/
│     │ │     ├── LICENSE.txt
│     │ │     ├── MaterialIcons-Regular.ijmap
│     │ │     ├── MaterialIcons-Regular.woff
│     │ │     └── MaterialIcons-Regular.woff2
│     │ └── js/
│     │     ├── echarts.min.js
│     │     ├── jquery.min.js
│     │     ├── mdui.esm.js.map
│     │     ├── mdui.js.map
│     │     ├── mdui.min.js
│     │     ├── mdui.min.js.map
│     │     └── paging.js
│     ├── domain.html
│     ├── img/
│     │ └── pay.jpg
│     ├── log.html
│     ├── login.html
│     ├── port.html
│     └── web.go
├── proxy-common/
│ ├── pom.xml
│ └── src/
│     └── main/
│         └── java/
│             └── miao/
│                 └── byusi/
│                     └── hp/
│                         └── common/
│                             ├── Test.java
│                             ├── codec/
│                             │ ├── HpMessageDecoder.java
│                             │ ├── HpMessageEncoder.java
│                             │ ├── PhotoMessageDecoder.java
│                             │ └── PhotoMessageEncoder.java
│                             ├── exception/
│                             │ └── HpException.java
│                             ├── handler/
│                             │ ├── HpAbsHandler.java
│                             │ ├── HpCommonHandler.java
│                             │ ├── PhotoGifMessageHandler.java
│                             │ ├── PhotoJpgMessageHandler.java
│                             │ ├── PhotoMessageHandler.java
│                             │ └── PhotoPngMessageHandler.java
│                             ├── message/
│                             │ └── Photo.java
│                             ├── protocol/
│                             │ └── HpMessageData.java
│                             └── utils/
│                                 └── SerializationUtil.java
├── proxy-proxy/
│ ├── pom.xml
│ └── src/
│     └── main/
│         ├── java/
│         │ └── miao/
│         │     └── byusi/
│         │         └── hp/
│         │             └── proxy/
│         │                 ├── StartProxy.java
│         │                 ├── annotation/
│         │                 │ ├── CheckApi.java
│         │                 │ └── HookCheckApi.java
│         │                 ├── config/
│         │                 │ ├── CostConfig.java
│         │                 │ └── WebConfig.java
│         │                 ├── controller/
│         │                 │ ├── IndexController.java
│         │                 │ └── PhotoController.java
│         │                 ├── domian/
│         │                 │ ├── bean/
│         │                 │ │ ├── ConInfo.java
│         │                 │ │ ├── ConnectInfo.java
│         │                 │ │ ├── GlobalStat.java
│         │                 │ │ └── Statistics.java
│         │                 │ └── vo/
│         │                 │     └── UserVo.java
│         │                 ├── except/
│         │                 │ └── GlobalException.java
│         │                 ├── handler/
│         │                 │ ├── HpServerHandler.java
│         │                 │ ├── RemoteProxyHandler.java
│         │                 │ ├── TcpServer.java
│         │                 │ └── proxy/
│         │                 │     ├── BackendHandler.java
│         │                 │     ├── FrontendHandler.java
│         │                 │     ├── RemoteUdpServerHandler.java
│         │                 │     └── RouterHandler.java
│         │                 ├── protocol/
│         │                 │ ├── HpProtocolDispatcher.java
│         │                 │ └── HpWebProxyProtocolDispatcher.java
│         │                 ├── queue/
│         │                 │ └── PhotoQueue.java
│         │                 ├── service/
│         │                 │ ├── HttpService.java
│         │                 │ └── nsfw/
│         │                 │     ├── NsfwService.java
│         │                 │     └── NsfwServiceImpl.java
│         │                 ├── task/
│         │                 │ └── FlowTask.java
│         │                 └── utils/
│         │                     ├── DateUtil.java
│         │                     ├── FileUtil.java
│         │                     ├── Md5Util.java
│         │                     └── NetUtil.java
│         └── resources/
│             ├── app.properties
│             ├── model/
│             │ └── nsfw.pb
│             ├── static/
│             │ ├── admin/
│             │ │ ├── css/
│             │ │ │ ├── mdui.css
│             │ │ │ ├── mdui.css.map
│             │ │ │ ├── mdui.min.css
│             │ │ │ ├── mdui.min.css.map
│             │ │ │ ├── paging.css
│             │ │ │ └── style.css
│             │ │ ├── fonts/
│             │ │ │ └── roboto/
│             │ │ │     ├── LICENSE.txt
│             │ │ │     ├── Roboto-Black.woff
│             │ │ │     ├── Roboto-Black.woff2
│             │ │ │     ├── Roboto-BlackItalic.woff
│             │ │ │     ├── Roboto-BlackItalic.woff2
│             │ │ │     ├── Roboto-Bold.woff
│             │ │ │     ├── Roboto-Bold.woff2
│             │ │ │     ├── Roboto-BoldItalic.woff
│             │ │ │     ├── Roboto-BoldItalic.woff2
│             │ │ │     ├── Roboto-Light.woff
│             │ │ │     ├── Roboto-Light.woff2
│             │ │ │     ├── Roboto-LightItalic.woff
│             │ │ │     ├── Roboto-LightItalic.woff2
│             │ │ │     ├── Roboto-Medium.woff
│             │ │ │     ├── Roboto-Medium.woff2
│             │ │ │     ├── Roboto-MediumItalic.woff
│             │ │ │     ├── Roboto-MediumItalic.woff2
│             │ │ │     ├── Roboto-Regular.woff
│             │ │ │     ├── Roboto-Regular.woff2
│             │ │ │     ├── Roboto-RegularItalic.woff
│             │ │ │     ├── Roboto-RegularItalic.woff2
│             │ │ │     ├── Roboto-Thin.woff
│             │ │ │     ├── Roboto-Thin.woff2
│             │ │ │     ├── Roboto-ThinItalic.woff
│             │ │ │     └── Roboto-ThinItalic.woff2
│             │ │ ├── icons/
│             │ │ │ └── material-icons/
│             │ │ │     ├── LICENSE.txt
│             │ │ │     ├── MaterialIcons-Regular.ijmap
│             │ │ │     ├── MaterialIcons-Regular.woff
│             │ │ │     └── MaterialIcons-Regular.woff2
│             │ │ └── js/
│             │ │     ├── echarts.min.js
│             │ │     ├── jquery.min.js
│             │ │     ├── mdui.esm.js.map
│             │ │     ├── mdui.js.map
│             │ │     ├── mdui.min.js
│             │ │     ├── mdui.min.js.map
│             │ │     └── paging.js
│             │ ├── favicon.ico
│             │ ├── index/
│             │ │ ├── css/
│             │ │ │ └── style.css
│             │ │ ├── favicon.ico
│             │ │ ├── image/
│             │ │ │ ├── ewm.png
│             │ │ │ └── icon.png
│             │ │ ├── index.html
│             │ │ ├── js/
│             │ │ │ └── script.js
│             │ │ └── teach/
│             │ │     └── teach.html
│             │ └── index.html
│             └── template/
│                 ├── backList.ftl
│                 ├── header.ftl
│                 ├── index.ftl
│                 ├── photoDetailList.ftl
│                 ├── photoList.ftl
│                 └── tmp.ftl
├── proxy-server/
│ ├── pom.xml
│ └── src/
│     ├── main/
│     │ ├── java/
│     │ │ └── miao/
│     │ │     └── byusi/
│     │ │         └── hp/
│     │ │             └── server/
│     │ │                 ├── AuthFilter.java
│     │ │                 ├── StartServer.java
│     │ │                 ├── config/
│     │ │                 │ ├── ConstConfig.java
│     │ │                 │ ├── SqlConfig.java
│     │ │                 │ └── WebConfig.java
│     │ │                 ├── controller/
│     │ │                 │ ├── admin/
│     │ │                 │ │ ├── AdminController.java
│     │ │                 │ │ ├── AppController.java
│     │ │                 │ │ ├── AutoConfigController.java
│     │ │                 │ │ ├── CoreController.java
│     │ │                 │ │ ├── DomainController.java
│     │ │                 │ │ ├── LogController.java
│     │ │                 │ │ ├── PayController.java
│     │ │                 │ │ ├── ProxyController.java
│     │ │                 │ │ ├── RegController.java
│     │ │                 │ │ ├── TipsController.java
│     │ │                 │ │ └── UserController.java
│     │ │                 │ ├── index/
│     │ │                 │ │ ├── IndexController.java
│     │ │                 │ │ └── LogController.java
│     │ │                 │ └── open/
│     │ │                 │     ├── ConfigController.java
│     │ │                 │     ├── NoticeController.java
│     │ │                 │     └── OpenApiController.java
│     │ │                 ├── dao/
│     │ │                 │ ├── AppDao.java
│     │ │                 │ ├── ConfigDao.java
│     │ │                 │ ├── CoreDao.java
│     │ │                 │ ├── DomainDao.java
│     │ │                 │ ├── PayDao.java
│     │ │                 │ ├── PortDao.java
│     │ │                 │ ├── StatisticsDao.java
│     │ │                 │ └── UserDao.java
│     │ │                 ├── domian/
│     │ │                 │ ├── bean/
│     │ │                 │ │ ├── ConnectInfo.java
│     │ │                 │ │ ├── DomainVo.java
│     │ │                 │ │ ├── GlobalStat.java
│     │ │                 │ │ └── Statistics.java
│     │ │                 │ ├── entity/
│     │ │                 │ │ ├── AppEntity.java
│     │ │                 │ │ ├── ConfigEntity.java
│     │ │                 │ │ ├── CoreEntity.java
│     │ │                 │ │ ├── DomainEntity.java
│     │ │                 │ │ ├── PayEntity.java
│     │ │                 │ │ ├── PortEntity.java
│     │ │                 │ │ ├── ProxyServerEntity.java
│     │ │                 │ │ ├── StatisticsEntity.java
│     │ │                 │ │ └── UserEntity.java
│     │ │                 │ └── vo/
│     │ │                 │     └── UserVo.java
│     │ │                 ├── exception/
│     │ │                 │ └── Ex.java
│     │ │                 ├── queue/
│     │ │                 │ ├── MailPushQueue.java
│     │ │                 │ └── MailQueue.java
│     │ │                 ├── service/
│     │ │                 │ ├── AppService.java
│     │ │                 │ ├── ConfigService.java
│     │ │                 │ ├── CoreService.java
│     │ │                 │ ├── DomainService.java
│     │ │                 │ ├── PayService.java
│     │ │                 │ ├── StatisticsService.java
│     │ │                 │ ├── UserService.java
│     │ │                 │ └── impl/
│     │ │                 │     ├── AppServiceImpl.java
│     │ │                 │     ├── ConfigServiceImpl.java
│     │ │                 │     ├── CoreServiceImpl.java
│     │ │                 │     ├── DomainServiceImpl.java
│     │ │                 │     ├── PayServiceImpl.java
│     │ │                 │     ├── StatisticsServiceImpl.java
│     │ │                 │     └── UserServiceImpl.java
│     │ │                 ├── task/
│     │ │                 │ └── FlowTask.java
│     │ │                 └── utils/
│     │ │                     ├── DateUtil.java
│     │ │                     ├── FileUtil.java
│     │ │                     ├── IpUtil.java
│     │ │                     ├── MailUtils.java
│     │ │                     ├── NetUtil.java
│     │ │                     └── UserCheckUtil.java
│     │ └── resources/
│     │     ├── app.properties
│     │     ├── db/
│     │     │ ├── db.db
│     │     │ └── init.sql
│     │     ├── log4j2.xml
│     │     ├── static/
│     │     │ ├── admin/
│     │     │ │ └── css/
│     │     │ │     └── style.css
│     │     │ ├── common/
│     │     │ │ ├── css/
│     │     │ │ │ ├── mdui.css
│     │     │ │ │ ├── mdui.css.map
│     │     │ │ │ ├── mdui.min.css
│     │     │ │ │ ├── mdui.min.css.map
│     │     │ │ │ ├── paging.css
│     │     │ │ │ └── style.css
│     │     │ │ ├── fonts/
│     │     │ │ │ └── roboto/
│     │     │ │ │     ├── LICENSE.txt
│     │     │ │ │     ├── Roboto-Black.woff
│     │     │ │ │     ├── Roboto-Black.woff2
│     │     │ │ │     ├── Roboto-BlackItalic.woff
│     │     │ │ │     ├── Roboto-BlackItalic.woff2
│     │     │ │ │     ├── Roboto-Bold.woff
│     │     │ │ │     ├── Roboto-Bold.woff2
│     │     │ │ │     ├── Roboto-BoldItalic.woff
│     │     │ │ │     ├── Roboto-BoldItalic.woff2
│     │     │ │ │     ├── Roboto-Light.woff
│     │     │ │ │     ├── Roboto-Light.woff2
│     │     │ │ │     ├── Roboto-LightItalic.woff
│     │     │ │ │     ├── Roboto-LightItalic.woff2
│     │     │ │ │     ├── Roboto-Medium.woff
│     │     │ │ │     ├── Roboto-Medium.woff2
│     │     │ │ │     ├── Roboto-MediumItalic.woff
│     │     │ │ │     ├── Roboto-MediumItalic.woff2
│     │     │ │ │     ├── Roboto-Regular.woff
│     │     │ │ │     ├── Roboto-Regular.woff2
│     │     │ │ │     ├── Roboto-RegularItalic.woff
│     │     │ │ │     ├── Roboto-RegularItalic.woff2
│     │     │ │ │     ├── Roboto-Thin.woff
│     │     │ │ │     ├── Roboto-Thin.woff2
│     │     │ │ │     ├── Roboto-ThinItalic.woff
│     │     │ │ │     └── Roboto-ThinItalic.woff2
│     │     │ │ ├── icons/
│     │     │ │ │ └── material-icons/
│     │     │ │ │     ├── LICENSE.txt
│     │     │ │ │     ├── MaterialIcons-Regular.ijmap
│     │     │ │ │     ├── MaterialIcons-Regular.woff
│     │     │ │ │     └── MaterialIcons-Regular.woff2
│     │     │ │ └── js/
│     │     │ │     ├── echarts.min.js
│     │     │ │     ├── jquery.min.js
│     │     │ │     ├── mdui.esm.js.map
│     │     │ │     ├── mdui.js.map
│     │     │ │     ├── mdui.min.js
│     │     │ │     ├── mdui.min.js.map
│     │     │ │     └── paging.js
│     │     │ ├── favicon.ico
│     │     │ ├── img/
│     │     │ │ └── pay.jpg
│     │     │ └── index/
│     │     │     └── css/
│     │     │         └── index.css
│     │     ├── template/
│     │     │ ├── admin/
│     │     │ │ ├── app.ftl
│     │     │ │ ├── config.ftl
│     │     │ │ ├── core.ftl
│     │     │ │ ├── domain.ftl
│     │     │ │ ├── header.ftl
│     │     │ │ ├── log.ftl
│     │     │ │ ├── login.ftl
│     │     │ │ ├── pay.ftl
│     │     │ │ ├── proxy.ftl
│     │     │ │ ├── reg.ftl
│     │     │ │ ├── tips.ftl
│     │     │ │ └── user.ftl
│     │     │ └── index/
│     │     │     ├── default.ftl
│     │     │     ├── header.ftl
│     │     │     ├── header_index.ftl
│     │     │     ├── index.ftl
│     │     │     └── log.ftl
│     │     └── templates/
│     │         └── email/
│     │             ├── proxy.svg
│     │             └── verification-code.html
│     └── test/
│         └── java/
│             └── test/
│                 └── PortTest.java
├── queue/
│ ├── fq.idx
│ └── fq_1.db
└── shell/
    ├── install.sh
    ├── install2.sh
    └── uninstall.sh

144 directories, 342 files
```