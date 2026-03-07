

# Proxy穿透安卓软件

基于 [HServer/hp-android-client](https://gitee.com/HServer/hp-android-client) 二次开发的安卓内网穿透客户端。

## 项目简介

本项目是一款安卓平台的内网穿透客户端应用程序，提供用户登录注册、服务器管理、远程访问等功能。通过该应用，用户可以在安卓设备上轻松实现内网穿透，将本地服务暴露到公网访问。

## 主要功能

### 用户管理
- 用户注册
- 用户登录
- 版本检测
- 远程日志查询

### 服务器管理
- 服务器列表加载
- 服务器连接管理
- 端口管理

### 核心特性
- **浮动窗口服务**：后台运行时显示浮动图标，点击可打开管理界面
- **WebView本地页面**：内置WebView加载本地服务页面
- **智能重连机制**：自动检测连接状态，失败后自动重试
- **网络状态检测**：自动检测网络连接情况
- **更新检测**：支持应用版本检测与更新
- **模拟器检测**：自动识别运行环境

## 项目结构

```
proxy-client/
├── app/src/main/java/miao/byusi/proxy_client/
│   ├── BaseApplication.java       # 应用初始化类
│   ├── MainActivity.java          # 主活动界面
│   ├── config/
│   │   └── ConstConfig.java       # 配置常量
│   ├── domian/vo/
│   │   ├── Server.java            # 服务器实体类
│   │   └── UserVo.java            # 用户信息实体类
│   ├── service/
│   │   ├── ProxyService.java      # 浮动窗口服务
│   │   └── UserService.java       # 用户相关服务
│   ├── ui/gallery/
│   │   └── LoadMoreListView.java  # 加载更多列表组件
│   └── util/
│       ├── DateUtil.java          # 日期工具类
│       └── SharedPreferencesUtil.java  # SharedPreferences封装
├── app/src/main/res/              # 资源文件
└── build.gradle                   # 构建配置
```

## 技术栈

- **Android SDK**：原生安卓开发
- **X5 WebView**：腾讯X5内核WebView
- **WindowManager**：浮动窗口管理
- **Handler**：消息处理机制
- **SharedPreferences**：本地数据存储

## 运行环境

- Android 6.0 (API 23) 及以上版本
- 支持armeabi-v7a、arm64-v8a、x86等架构

## 依赖库

- MT管理器文件提供器 (MTDataFilesProvider-v1.0.0.aar)
- Android系统WebView (android.aar)

## 使用说明

### 1. 安装配置
1. 编译生成APK文件
2. 安装到安卓设备
3. 启动应用

### 2. 用户操作
- **注册/登录**：使用用户名密码进行注册和登录
- **连接服务器**：登录后自动加载可用服务器列表
- **访问内网服务**：通过WebView访问穿透后的服务

### 3. 浮动窗口
- 服务启动后显示浮动图标
- 点击图标可快速访问管理界面
- 长按可隐藏或关闭

## 开发说明

### 构建命令

```bash
# Windows
gradlew.bat assembleDebug

# Linux/Mac
./gradlew assembleDebug
```

### 代码规范
- Java编码规范
- 遵循安卓设计指南
- 模块化开发

## 版本信息

- 当前版本：通过VersionHandler获取
- 自动检测更新：支持

## 许可证

本项目基于开源协议，具体许可证信息请参考 LICENSE 文件。

## 贡献者

感谢 [HServer/hp-android-client](https://gitee.com/HServer/hp-android-client) 项目提供的基础代码。

## 反馈与支持

如有问题或建议，欢迎通过Gitee项目页面提交Issue。

---

[![ByUsi/Proxy内网穿透](https://gitee.com/byusi/proxy/widgets/widget_card.svg?colors=4183c4,ffffff,ffffff,e3e9ed,666666,9b9b9b)](https://gitee.com/byusi/proxy)