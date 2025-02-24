#!/bin/bash
set -e

# 颜色配置
RED="\033[1;31m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
CYAN="\033[1;36m"
BOLD="\033[1m"
RESET="\033[0m"

# 进度条函数
progress_bar() {
    local duration=${1}
    (
        local blocks=30
        for ((i=0; i<=blocks; i++)); do
            printf "[${GREEN}"
            for ((j=0; j<i; j++)); do printf "#"; done
            for ((j=i; j<blocks; j++)); do printf " "; done
            printf "${RESET}] ${CYAN}%3d%%${RESET}\r" $((i*100/blocks))
            sleep "$duration"
        done
        printf "\n"
    ) &
}

# 显示菜单
show_menu() {
    clear
    echo -e "${BOLD}${BLUE}╔══════════════════════════╗${RESET}"
    echo -e "${BOLD}${BLUE}║   █▀█ █▀█ █▀▀ █▀▄ █▀▀    ║${RESET}"
    echo -e "${BOLD}${BLUE}║   █▄█ █▀▀ ██▄ █▄▀ ██▄    ║${RESET}"
    echo -e "${BOLD}${BLUE}╚══════════════════════════╝${RESET}"
    echo
    echo -e "${CYAN}1) Linux 安装"
    echo -e "2) Termux 安装"
    echo -e "3) 退出程序${RESET}"
    echo
}

# 架构检测
detect_arch() {
    case $(uname -m) in
        x86_64)  echo "amd64" ;;
        aarch64) echo "arm64" ;;
        armv7l)  echo "armv7" ;;
        armv8l)  echo "arm64" ;;
        i*86)    echo "386" ;;
        *)       echo -e "${RED}不支持的架构: $(uname -m)${RESET}" >&2; exit 1 ;;
    esac
}

# 下载函数
download_file() {
    local url="$1"
    local output="$2"
    
    echo -e "${CYAN}▶ 下载客户端...${RESET}"
    if command -v curl &>/dev/null; then
        if ! curl -#L -o "$output" "$url"; then
            echo -e "${RED}✗ 下载失败！错误码: $?${RESET}" >&2
            return 1
        fi
    elif command -v wget &>/dev/null; then
        if ! wget --show-progress -q -O "$output" "$url"; then
            echo -e "${RED}✗ 下载失败！错误码: $?${RESET}" >&2
            return 1
        fi
    else
        echo -e "${RED}需要 curl 或 wget 来执行下载${RESET}" >&2
        return 1
    fi
}

# 安装流程
install_proxy() {
    local os_type="$1"
    local arch=$(detect_arch)
    local filename="proxy-client-${arch}"
    local url="https://api.www.byusi.cn/proxy/client/${filename}"

    # 设置安装路径
    case "$os_type" in
        linux)
            INSTALL_DIR="/usr/local/bin"
            SUDO_CMD="sudo"
            ;;
        termux)
            INSTALL_DIR="$HOME/../usr/bin"
            SUDO_CMD=""
            [ -d "$INSTALL_DIR" ] || {
                echo -e "${RED}✗ Termux环境验证失败${RESET}" >&2
                exit 1
            }
            ;;
    esac

    # 创建临时文件
    local tmp_file=$(mktemp)
    trap "rm -f '$tmp_file'" EXIT

    # 执行下载
    if ! download_file "$url" "$tmp_file"; then
        exit 1
    fi

    # 安装文件
    echo -e "\n${CYAN}▶ 正在安装到 ${YELLOW}${INSTALL_DIR}${RESET}"
    $SUDO_CMD mkdir -p "$INSTALL_DIR"
    $SUDO_CMD mv -f "$tmp_file" "$INSTALL_DIR/proxy"
    $SUDO_CMD chmod +x "$INSTALL_DIR/proxy"

    # 验证安装
    if [ -x "$INSTALL_DIR/proxy" ]; then
        echo -e "\n${GREEN}✓ 安装成功！${RESET}"
        echo -e "文件路径: ${BOLD}${INSTALL_DIR}/proxy${RESET}"
        
        # 检查PATH
        if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
            echo -e "${YELLOW}⚠ 注意: 安装目录未加入PATH环境变量${RESET}"
            echo -e "请将以下内容添加到shell配置文件："
            echo -e "export PATH=\"\$PATH:${INSTALL_DIR}\""
        fi
    else
        echo -e "${RED}✗ 安装验证失败！${RESET}" >&2
        exit 1
    fi
}

# 主程序
while true; do
    show_menu
    read -rp "请选择操作 [1-3]: " choice
    case $choice in
        1)
            if [ "$(id -u)" -ne 0 ]; then
                echo -e "${YELLOW}⚠ 建议使用sudo权限执行！${RESET}"
                read -rp "是否继续？[y/N] " confirm
                [[ "$confirm" =~ ^[Yy] ]] || exit 0
            fi
            install_proxy "linux"
            break
            ;;
        2)
            install_proxy "termux"
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
