# Proxy内网穿透

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
  wget -qO- https://gitee.com/byusi/proxy/raw/master/shell/install2.sh | bash
  ```
  - GitHub
  ```bash
  wget -qO- https://raw.githubusercontent.com/ByUsiTeam/Proxy/master/shell/install2.sh | bash
  ```

### **Termux**和**Linux**快速解除部署脚本
  - Gitee
  ```bash
  wget -qO- https://gitee.com/byusi/proxy/raw/master/shell/uninstall.sh | bash
  ```

  - GitHub
  ```bash
  wget -qO- https://raw.githubusercontent.com/ByUsiTeam/Proxy/master/shell/uninstall.sh | bash
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
