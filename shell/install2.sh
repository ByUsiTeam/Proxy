#!/bin/bash
apt update -y
apt install -y whiptail curl wget zip unzip
set -e

# 显示whiptail对话框函数
show_mainmenu() {
    whiptail --title "Proxy穿透安装" --menu "请选择安装类型：" 15 45 3 \
        "1" "Linux 安装" \
        "2" "Termux 安装" \
        "3" "退出" 3>&1 1>&2 2>&3
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
            whiptail --msgbox "不支持的架构: $arch" 8 40
            exit 1
            ;;
    esac
}

# 权限验证
verify_privilege() {
    if [ "$os_type" = "linux" ] && [ "$(id -u)" -ne 0 ]; then
        whiptail --yesno "检测到当前非root权限，建议使用sudo执行！\n是否继续尝试安装？" 10 40
        if [ $? -ne 0 ]; then
            exit 0
        fi
    fi
}

# 下载执行器
download_file() {
    local url="$1"
    local output="$2"
    
    if command -v curl &> /dev/null; then
        if ! curl -#L -o "$output" "$url"; then
            whiptail --msgbox "下载失败！错误码: $?" 8 40
            return 1
        fi
    elif command -v wget &> /dev/null; then
        if ! wget --show-progress -q -O "$output" "$url"; then
            whiptail --msgbox "下载失败！错误码: $?" 8 40
            return 1
        fi
    else
        whiptail --msgbox "需要 curl 或 wget 来执行下载" 8 40
        return 1
    fi
}

# 安装流程
perform_installation() {
    local os_type=$1
    local ARCH=$(detect_architecture)
    local FILENAME="proxy-client-${ARCH}"
    local DOWNLOAD_URL="https://api.www.byusi.cn/proxy/client/${FILENAME}"

    if [ "$os_type" = "termux" ]; then
        FILENAME="proxy-client-android"
        DOWNLOAD_URL="https://api.www.byusi.cn/proxy/client/${FILENAME}"
    fi

    local TEMP_FILE=$(mktemp)

    # 设置安装路径
    case "$os_type" in
        linux)
            INSTALL_DIR="/usr/local/bin"
            NEED_SUDO=true
            ;;
        termux)
            INSTALL_DIR="$PREFIX/bin"
            NEED_SUDO=false
            [ -d "$INSTALL_DIR" ] || {
                whiptail --msgbox "错误：Termux环境验证失败" 8 40
                exit 1
            }
            ;;
    esac

    # 下载文件
    whiptail --infobox "正在下载客户端..." 8 40
    if ! download_file "$DOWNLOAD_URL" "$TEMP_FILE"; then
        rm -f "$TEMP_FILE"
        exit 1
    fi

    # 安装文件
    $NEED_SUDO && SUDO_CMD="sudo" || SUDO_CMD=""
    $SUDO_CMD mkdir -p "$INSTALL_DIR"
    $SUDO_CMD mv -f "$TEMP_FILE" "$INSTALL_DIR/proxy"
    $SUDO_CMD chmod +x "$INSTALL_DIR/proxy"

    # 验证安装
    if [ -x "$INSTALL_DIR/proxy" ]; then
        whiptail --msgbox "✓ 安装成功！\n文件路径: ${INSTALL_DIR}/proxy" 12 50
        if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
            # whiptail --msgbox "注意: 安装目录未加入PATH环境变量\n请执行: export PATH=\"\$PATH:${INSTALL_DIR}\"" 12 50
            echo "额"
        fi
    else
        whiptail --msgbox "✗ 安装验证失败！" 8 40
        exit 1
    fi
}

# 主程序
while true; do
    choice=$(show_mainmenu || exit 0)
    
    case $choice in
        1)
            os_type="linux"
            verify_privilege
            perform_installation "$os_type"
            ;;
        2)
            os_type="termux"
            perform_installation "$os_type"
            ;;
        3)
            exit 0
            ;;
        *)
            exit 0
            ;;
    esac
done