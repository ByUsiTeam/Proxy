#!/bin/bash
set -e

# 彩色输出配置
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
BOLD='\033[1m'
RESET='\033[0m'

# 显示菜单
show_menu() {
    clear
    echo -e "${BOLD}${BLUE}==== Proxy穿透安装 ====${RESET}"
    echo -e "1) Linux 安装"
    echo -e "2) Termux 安装"
    echo -e "3) 退出"
    echo -n "请选择安装类型 [1-3]: "
}

# 智能架构检测
detect_architecture() {
    local arch=$(uname -m)
    case "$arch" in
        x86_64)   echo "amd64" ;;
        aarch64)  echo "arm64" ;;
        armv7l)   echo "armv7" ;;
        armv8l)   echo "arm64" ;;
        i686|i386) echo "386" ;;
        *)
            echo -e "${RED}不支持的架构: $arch${RESET}"
            exit 1
            ;;
    esac
}

# 权限验证
verify_privilege() {
    if [ "$os_type" = "linux" ] && [ "$(id -u)" -ne 0 ]; then
        echo -e "${YELLOW}检测到当前非root权限，建议使用sudo执行！${RESET}"
        read -p "是否继续尝试安装？[y/N] " confirm
        [[ $confirm =~ ^[Yy] ]] || exit 0
    fi
}

# 下载执行器
download_file() {
    local url="$1"
    local output="$2"
    
    echo -e "${BLUE}下载链接: ${YELLOW}$url${RESET}"
    
    if command -v curl &> /dev/null; then
        if ! curl -#L -o "$output" "$url"; then
            echo -e "${RED}下载失败！错误码: $?${RESET}"
            return 1
        fi
    elif command -v wget &> /dev/null; then
        if ! wget --show-progress -q -O "$output" "$url"; then
            echo -e "${RED}下载失败！错误码: $?${RESET}"
            return 1
        fi
    else
        echo -e "${RED}需要 curl 或 wget 来执行下载${RESET}"
        return 1
    fi
}

# 安装流程
perform_installation() {
    local os_type=$1
    local ARCH=$(detect_architecture)
    local FILENAME="proxy-client-${ARCH}"
    local DOWNLOAD_URL="https://api.www.byusi.cn/proxy/client/${FILENAME}"
    local TEMP_FILE=$(mktemp)

    # 设置安装路径
    case "$os_type" in
        linux)
            INSTALL_DIR="/usr/local/bin"
            NEED_SUDO=true
            ;;
        termux)
            INSTALL_DIR="$HOME/../usr/bin"
            NEED_SUDO=false
            # Termux环境验证
            [ -d "$INSTALL_DIR" ] || {
                echo -e "${RED}错误：Termux环境验证失败${RESET}"
                exit 1
            }
            ;;
    esac

    # 开始下载
    echo -e "\n${BOLD}${BLUE}▶ 开始下载客户端...${RESET}"
    if ! download_file "$DOWNLOAD_URL" "$TEMP_FILE"; then
        rm -f "$TEMP_FILE"
        exit 1
    fi

    # 安装执行
    echo -e "\n${BOLD}${BLUE}▶ 正在安装到 ${YELLOW}${INSTALL_DIR}${RESET}"
    $NEED_SUDO && SUDO_CMD="sudo" || SUDO_CMD=""
    
    $SUDO_CMD mkdir -p "$INSTALL_DIR"
    $SUDO_CMD mv -f "$TEMP_FILE" "$INSTALL_DIR/proxy"
    $SUDO_CMD chmod +x "$INSTALL_DIR/proxy"

    # 安装验证
    if [ -x "$INSTALL_DIR/proxy" ]; then
        echo -e "\n${GREEN}✓ 安装成功！${RESET}"
        echo -e "文件路径: ${BOLD}${INSTALL_DIR}/proxy${RESET}"
        
        # PATH检测
        if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
            echo -e "${YELLOW}⚠ 注意: 安装目录未加入PATH环境变量${RESET}"
            echo -e "请将以下内容添加到shell配置文件："
            echo -e "export PATH=\"\$PATH:${INSTALL_DIR}\""
        fi
    else
        echo -e "${RED}✗ 安装验证失败！${RESET}"
        exit 1
    fi
}

# 主程序
while true; do
    show_menu
    read -r choice
    case $choice in
        1)
            os_type="linux"
            verify_privilege
            perform_installation "$os_type"
            break
            ;;
        2)
            os_type="termux"
            perform_installation "$os_type"
            break
            ;;
        3)
            echo -e "${YELLOW}安装已取消${RESET}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选项，请重新输入！${RESET}"
            sleep 1
            ;;
    esac
done