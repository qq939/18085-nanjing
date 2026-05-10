#!/bin/bash
# Hermit-Claw Web App 8082 启动脚本
# 日志输出到 logs/start.log

set -e

cd /home/agent/.claude/workspace/project

# 确保日志目录存在
mkdir -p logs

# 启动静态文件服务器 (端口8082)
echo "[$(date)] 启动 Web 服务器 (端口8082)..." >> logs/start.log
echo "[$(date)] 服务静态文件: index.html" >> logs/start.log

# 使用 Node.js 启动静态文件服务器
node server.js >> logs/start.log 2>&1 &

echo "[$(date)] Web 服务器已启动，监听 0.0.0.0:8082" >> logs/start.log
echo "[$(date)] 启动脚本执行完成" >> logs/start.log
