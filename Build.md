# Proxy内网穿越编译教程
> 演示是手机 **Termux**，这个教程不一定适配你的设备，但是我会尽量保证适配基于 **Debian** 的 **Linux** 发行版    

## 基础环境安装
1. 更新系统环境
  ```bash
  apt update
  apt upgrade
  ```
  > 如果遇到询问，请输入y回车

2. 安装必要的软件包
  ```bash
  apt install git openjdk-17-jdk maven golang -y
  ```
  > 如果出现报错的话，请复制日志喂给AI，让他帮你解决这个问题（处理这个问题的时候请尽量包含耐心，不要气馁，也不要乱发脾气）

3. 拉取代码进入目录
  - Gitee（国内环境推荐）
  ```bash
  git clone https://gitee.com/byusi/proxy.git
  cd proxy
  ```
  - Github（国外环境推荐）
  ```bash
  git clone https://github.com/byusiteam/proxy.git
  cd proxy
  ```
  > 这个步骤一般情况下不会报错，上一个不行的话换下一个

4. 编译Java代码（出现报错请自行复制报错日志，发给AI工具）
  1. 根据需要修改配置
   - 服务端
    ```bash
    nano proxy-server/src/main/resources/app.properties
    ```
   - 节点端
    ```bash
    nano proxy-proxy/src/main/resources/app.properties
    ```
  2. 修改客户端的程序的API地址
   ```bash
   nano proxy-client-golang/main.go
   ```
   > 注意只需要修改 89 行的 `web.InitCloudDevice("http://proxy.byusi.cn:9090", deviceId, logLevel)` 中的 `http://proxy.byusi.cn:9090` 为你的服务器的地址

  3. 编译Java程序
   ```bash
   mvn clean package
   ```
   > 编译之后的程序在 **proxy-server/target** 和 **proxy-proxy/target** 目录中，编译产出文件是以 **.jar** 结尾的，运行非常简单，只需要执行 **java -jar <路径>/<.jar文件>** 就可以运行了

  4. 编译golang客户端（用于本地服务，发送本地数据包到服务端，简单来说就是沟通本地与服务端，由服务端发送到公网，客户端发送本地数据到服务端）
   - golang库安装
   ```bash
   cd proxy-client-golang
   go mod tidy
   ```
   - 编译go程序
   ```bash
   chmod +x build.sh
   ./build.sh
   ```
   > 编译完成的二进制文件在 **build** 目录中，根据自己的系统架构选择，**Linux x86_64** 系统的用户选择 **proxy-client-amd64** 就行了

## 声明
1. 该教程不一定适配你的设备，但大概思路和方法与上面说的大相径庭
2. 如果你根据上面的教程没有成功编译程序的话，那么请请教AI或者是请教其他大佬，我的话不一定能帮你解决，并且你也不一定联系的上我
3. 不管你编译的成果如何，请心平气和