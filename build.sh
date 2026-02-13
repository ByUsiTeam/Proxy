#!/bin/bash
# 编译脚本 - 用于构建proxy项目
# 使用方法: ./build.sh

set -e  # 遇到错误立即退出
set -u  # 使用未定义变量时报错

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 打印带颜色的信息
info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 清屏
clear

# 确认函数
confirm() {
    warn "请确保所有该修改的都修改了！！"
    echo -n "是否继续? (y/n, 默认10秒后自动继续): "
    
    # 10秒超时，默认继续
    read -t 10 confirm
    if [[ "$confirm" != "n" && "$confirm" != "N" ]]; then
        info "继续执行..."
    else
        error "用户取消编译"
        exit 1
    fi
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        warn "$1 未安装，正在安装..."
        return 1
    else
        info "$1 已安装"
        return 0
    fi
}

# 安装依赖
install_dependencies() {
    info "检查并安装必要的依赖..."
    
    # 更新包列表
    apt update -qq
    
    # 需要安装的包
    local packages=("maven" "wget" "golang")
    local to_install=()
    
    for pkg in "${packages[@]}"; do
        if ! dpkg -l | grep -q "^ii  $pkg "; then
            to_install+=("$pkg")
        fi
    done
    
    if [ ${#to_install[@]} -ne 0 ]; then
        info "安装: ${to_install[*]}"
        apt install -y "${to_install[@]}"
    else
        info "所有依赖已安装"
    fi
}

# 编译Java模块
build_java() {
    info "开始编译Java模块..."
    
    if [ -f "pom.xml" ]; then
        mvn clean package
        if [ $? -eq 0 ]; then
            success "Java模块编译成功"
        else
            error "Java模块编译失败"
            return 1
        fi
    else
        error "找不到pom.xml文件"
        return 1
    fi
}

# 编译Go模块
build_go() {
    info "开始编译Go模块..."
    
    if [ -d "proxy-client-golang" ]; then
        cd proxy-client-golang
        
        # 检查go.mod是否存在
        if [ ! -f "go.mod" ]; then
            warn "初始化go.mod"
            go mod init proxy-client-golang
        fi
        
        # 整理依赖
        go mod tidy
        info "Go依赖整理完成"
        
        # 执行构建脚本
        if [ -f "build.sh" ]; then
            bash build.sh
            if [ $? -eq 0 ]; then
                success "Go模块编译成功"
            else
                error "Go模块编译失败"
                return 1
            fi
        else
            error "找不到build.sh文件"
            return 1
        fi
        
        cd - > /dev/null
    else
        error "找不到proxy-client-golang目录"
        return 1
    fi
}

# 显示输出目录
show_output() {
    success "编译完成！输出目录如下："
    
    # 检查并显示各输出目录
    if [ -d "proxy-server/target" ]; then
        echo -e "  ${GREEN}✓${NC} proxy-server/target"
        ls -la proxy-server/target | grep -E "\.jar$|\.war$" | sed 's/^/      /'
    else
        echo -e "  ${RED}✗${NC} proxy-server/target (目录不存在)"
    fi
    
    if [ -d "proxy-proxy/target" ]; then
        echo -e "  ${GREEN}✓${NC} proxy-proxy/target"
        ls -la proxy-proxy/target | grep -E "\.jar$|\.war$" | sed 's/^/      /'
    else
        echo -e "  ${RED}✗${NC} proxy-proxy/target (目录不存在)"
    fi
    
    if [ -d "proxy-client-golang/build" ]; then
        echo -e "  ${GREEN}✓${NC} proxy-client-golang/build"
        ls -la proxy-client-golang/build | grep -E "proxy|client" | sed 's/^/      /'
    else
        echo -e "  ${RED}✗${NC} proxy-client-golang/build (目录不存在)"
    fi
}

# 主函数
main() {
    info "===== Proxy项目编译脚本 ====="
    
    # 确认是否继续
    confirm
    
    # 检查是否为root用户
    if [ "$EUID" -ne 0 ]; then 
        warn "建议以root用户运行以确保依赖安装成功"
        warn "当前用户: $(whoami)"
    fi
    
    # 安装依赖
    install_dependencies
    
    # 编译Java模块
    build_java || { error "Java编译失败，终止构建"; exit 1; }
    
    # 编译Go模块
    build_go || { error "Go编译失败，终止构建"; exit 1; }
    
    # 显示输出目录
    show_output
    
    success "所有编译步骤完成！"
}

# 执行主函数
main "$@"