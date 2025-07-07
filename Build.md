# Proxy内网穿越编译教程  

> **适用说明**  
> 本教程基于手机Termux环境演示，适配**Debian系Linux发行版**。  
> 如遇环境差异，请灵活调整或寻求AI帮助解决。  

---

## 一、基础环境准备  

### 1. 系统更新  
```bash  
apt update && apt upgrade -y  
```  
> 出现提示时输入 `y` 并回车  

### 2. 安装依赖  
```bash  
apt install git openjdk-17-jdk maven golang -y  
```  
> **报错处理**：复制完整日志求助AI工具，保持耐心  

---

## 二、代码获取  
### ▶ 国内用户（Gitee源）  
```bash  
git clone https://gitee.com/byusi/proxy.git  
cd proxy  
```  

### ▶ 国际用户（Github源）  
```bash  
git clone https://github.com/byusiteam/proxy.git  
cd proxy  
```  
> 任一源失败可切换另一个  

---

## 三、配置修改  
### 1. 服务端配置  
```bash  
nano proxy-server/src/main/resources/app.properties  
```  

### 2. 节点端配置  
```bash  
nano proxy-proxy/src/main/resources/app.properties  
```  

### 3. 客户端API地址  
```bash  
nano proxy-client-golang/main.go  
```  
> **关键修改**：  
> 将第89行 `web.InitCloudDevice("http://proxy.byusi.cn:9090", deviceId, logLevel)`  
> 中的URL替换为你的服务器地址  

---

## 四、编译流程  
### ▶ Java程序编译  
```bash  
mvn clean package  
```  
**输出位置**：  
- 服务端 → `proxy-server/target/*.jar`  
- 节点端 → `proxy-proxy/target/*.jar`  

**运行命令**：  
```bash  
java -jar /路径/文件名.jar  
```  

### ▶ Golang客户端编译  
```bash  
cd proxy-client-golang  
go mod tidy           # 安装依赖  
chmod +x build.sh     # 添加执行权限  
./build.sh            # 开始编译  
```  
**输出位置**：  
- 二进制文件 → `build/` 目录  
- **Linux x86_64用户** → 选择 `proxy-client-amd64`  

---

## 重要声明  
1. **环境差异**：教程可能不完全适配你的设备，但核心流程通用  
2. **故障处理**：  
   - 编译报错 → 复制完整日志求助AI工具  
   - 联系作者 → 可能无法及时响应  
3. **心态建议**：  
   - 保持心平气和  
   - 技术问题可通过社区/论坛解决  

> **最后提示**：内网穿透涉及网络安全，请遵守当地法律法规使用