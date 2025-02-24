#!/usr/bin/env python3
import os
import platform
import shutil
import sys
import tempfile
from typing import Optional

import requests
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress
from rich.prompt import Confirm, IntPrompt, Prompt
from rich.style import Style

# 初始化Rich控制台
console = Console()

# 样式配置
STYLE_TITLE = Style(color="blue", bold=True)
STYLE_PROMPT = Style(color="cyan", bold=True)
STYLE_WARNING = Style(color="yellow")
STYLE_ERROR = Style(color="red")
STYLE_SUCCESS = Style(color="green", bold=True)
STYLE_HIGHLIGHT = Style(color="yellow", bold=True)

def show_menu() -> int:
    """显示主菜单并获取用户选择"""
    console.clear()
    console.print(
        Panel.fit(
            "[bold]==== Proxy穿透安装 ====[/bold]",
            style=STYLE_TITLE,
            subtitle="by @智能助理"
        )
    )
    console.print("1) Linux 安装")
    console.print("2) Termux 安装")
    console.print("3) 退出程序")
    return IntPrompt.ask(
        "[cyan]请选择安装类型[/cyan]",
        choices=["1", "2", "3"],
        show_choices=False
    )

def detect_architecture() -> str:
    """检测系统架构"""
    arch = platform.machine().lower()
    arch_map = {
        "x86_64": "amd64",
        "amd64": "amd64",
        "aarch64": "arm64",
        "armv7l": "armv7",
        "armv8l": "arm64",
        "i686": "386",
        "i386": "386"
    }
    if arch not in arch_map:
        console.print(f"✗ 不支持的架构: {arch}", style=STYLE_ERROR)
        sys.exit(1)
    return arch_map[arch]

def verify_privilege(os_type: str) -> bool:
    """验证权限"""
    if os_type == "linux" and os.geteuid() != 0:
        console.print("⚠ 检测到当前非root权限，建议使用sudo执行！", style=STYLE_WARNING)
        if not Confirm.ask("是否继续尝试安装？", default=False):
            sys.exit(0)
        return False
    return True

def download_file(url: str, output_path: str) -> bool:
    """带进度显示的文件下载"""
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            total_size = int(r.headers.get('content-length', 0))

            with Progress(transient=True) as progress:
                task = progress.add_task(
                    f"[cyan]下载 {os.path.basename(output_path)}...",
                    total=total_size
                )
                
                with open(output_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                        progress.update(task, advance=len(chunk))
        return True
    except Exception as e:
        console.print(f"✗ 下载失败: {str(e)}", style=STYLE_ERROR)
        return False

def perform_installation(os_type: str, use_sudo: bool = False):
    """执行安装流程"""
    # 获取架构信息
    arch = detect_architecture()
    filename = f"proxy-client-{arch}"
    download_url = f"https://api.www.byusi.cn/proxy/client/{filename}"

    # 设置安装路径
    install_dir = ""
    if os_type == "linux":
        install_dir = "/usr/local/bin"
    elif os_type == "termux":
        install_dir = os.path.expanduser("~/../usr/bin")
        if not os.path.isdir(install_dir):
            console.print("✗ Termux环境验证失败", style=STYLE_ERROR)
            sys.exit(1)

    # 创建临时文件
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_path = temp_file.name
        temp_file.close()
    except Exception as e:
        console.print(f"✗ 创建临时文件失败: {str(e)}", style=STYLE_ERROR)
        sys.exit(1)

    # 下载文件
    console.print(f"\n▶ 开始下载客户端 [dim]({arch})[/dim]", style=STYLE_TITLE)
    if not download_file(download_url, temp_path):
        os.unlink(temp_path)
        sys.exit(1)

    # 移动文件
    console.print(f"\n▶ 正在安装到 [bold yellow]{install_dir}[/]", style=STYLE_TITLE)
    target_path = os.path.join(install_dir, "proxy")
    
    try:
        if use_sudo and os.geteuid() != 0:
            console.print(f"[dim]执行sudo mv -f {temp_path} {target_path}[/dim]")
            result = os.system(f"sudo mv -f {temp_path} {target_path}")
            if result != 0:
                raise PermissionError("需要管理员权限")
        else:
            os.makedirs(install_dir, exist_ok=True)
            shutil.move(temp_path, target_path)
        
        os.chmod(target_path, 0o755)
    except Exception as e:
        console.print(f"✗ 安装失败: {str(e)}", style=STYLE_ERROR)
        sys.exit(1)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    # 验证安装
    if os.path.isfile(target_path):
        console.print(f"\n✓ 安装成功！\n文件路径: [bold cyan]{target_path}[/]", style=STYLE_SUCCESS)
        
        # 检查PATH环境变量
        path_env = os.getenv("PATH", "")
        if install_dir not in path_env.split(os.pathsep):
            console.print(
                f"⚠ 注意: 安装目录未加入PATH环境变量\n"
                f"请将以下内容添加到shell配置文件：\n"
                f"[bold]export PATH=\"$PATH:{install_dir}\"[/]",
                style=STYLE_WARNING
            )
    else:
        console.print("✗ 安装验证失败！", style=STYLE_ERROR)
        sys.exit(1)

def main():
    while True:
        try:
            choice = show_menu()
            if choice == 3:
                console.print("安装已取消", style=STYLE_WARNING)
                sys.exit(0)

            os_type = "linux" if choice == 1 else "termux"
            use_sudo = verify_privilege(os_type) if choice == 1 else False
            perform_installation(os_type, use_sudo=use_sudo)
            break

        except KeyboardInterrupt:
            console.print("\n安装已取消", style=STYLE_WARNING)
            sys.exit(0)

if __name__ == "__main__":
    main()
