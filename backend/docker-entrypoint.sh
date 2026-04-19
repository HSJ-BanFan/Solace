#!/bin/sh
set -e

# 配置文件路径（可通过环境变量覆盖）
CONFIG_PATH="${CONFIG_PATH:-/app/config/config.toml}"
CONFIG_DIR=$(dirname "$CONFIG_PATH")

# 创建配置目录（如果不存在）
mkdir -p "$CONFIG_DIR"

# 如果配置文件不存在，从示例文件复制
if [ ! -f "$CONFIG_PATH" ]; then
    echo "Config file not found at $CONFIG_PATH, copying from example..."
    cp /app/config.toml.example "$CONFIG_PATH"
    # 设置权限，让 appuser 可以读取
    chmod 644 "$CONFIG_PATH"
fi

# 切换到 appuser 并启动应用
exec su-exec appuser ./server
