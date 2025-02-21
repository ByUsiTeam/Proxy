#!/bin/bash
set -e

# 彩色输出配置
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
BOLD='\033[1m'
RESET='\033[0m'

# 显示删除菜单
show_menu() {
    clear
    echo -e "${BOLD}${BLUE}==== Proxy穿透卸载 ====${RESET}"
    echo -e "1) Linux 卸载"
    echo -e "2) Termux 卸载"
    echo -e "3) 退出"
    echo -n "请选择卸载类型 [1-3]: "
}

# 删除操作处理
uninstall_proxy() {
    local os_type=$1
    local FILE_PATH

    case "$os_type" in
        linux)
            FILE_PATH="/usr/local/bin/proxy"
            NEED_SUDO=true
            ;;
        termux)
            FILE_PATH="$HOME/../usr/bin/proxy"
            NEED_SUDO=false
            ;;
    esac

    echo -e "\n${BOLD}${BLUE}▶ 正在检查安装文件...${RESET}"
    
    if [ -f "$FILE_PATH" ]; then
        echo -e "找到安装文件: ${YELLOW}$FILE_PATH${RESET}"
        read -p "确定要删除proxy客户端吗？[y/N] " confirm
        if [[ $confirm =~ ^[Yy] ]]; then
            # 执行删除操作
            if $NEED_SUDO; then
                if sudo rm -f "$FILE_PATH"; then
                    echo -e "${GREEN}✓ 成功删除proxy客户端！${RESET}"
                else
                    echo -e "${RED}✗ 删除失败，请检查权限！${RESET}"
                    exit 1
                fi
            else
                if rm -f "$FILE_PATH"; then
                    echo -e "${GREEN}✓ 成功删除proxy客户端！${RESET}"
                else
                    echo -e "${RED}✗ 删除失败，请检查权限！${RESET}"
                    exit 1
                fi
            fi
        else
            echo -e "${YELLOW}已取消删除操作${RESET}"
        fi
    else
        echo -e "${YELLOW}⚠ 未找到proxy客户端，可能已经卸载${RESET}"
    fi
}

# 主程序
while true; do
    show_menu
    read -r choice
    case $choice in
        1)
            uninstall_proxy "linux"
            break
            ;;
        2)
            uninstall_proxy "termux"
            break
            ;;
        3)
            echo -e "${YELLOW}已取消卸载${RESET}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选项，请重新输入！${RESET}"
            sleep 1
            ;;
    esac
done