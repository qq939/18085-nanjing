#!/bin/bash
# Hermit-Claw Web App 8082 启动脚本
# 日志输出到 logs/start.log

set -e

cd /home/agent/.claude/workspace/project

# 确保日志目录存在
mkdir -p logs

# 检查是否有 Web 应用入口
if [ -f "app.py" ]; then
    echo "[$(date)] 启动 Python Flask/FastAPI 应用..." >> logs/start.log
    python3 app.py >> logs/start.log 2>&1 &
elif [ -f "server.js" ]; then
    echo "[$(date)] 启动 Node.js 应用..." >> logs/start.log
    node server.js >> logs/start.log 2>&1 &
elif [ -f "index.js" ]; then
    echo "[$(date)] 启动 Node.js 应用..." >> logs/start.log
    node index.js >> logs/start.log 2>&1 &
elif [ -f "main.py" ]; then
    echo "[$(date)] 启动 Python 应用..." >> logs/start.log
    python3 main.py >> logs/start.log 2>&1 &
else
    echo "[$(date)] 未检测到 Web 应用入口文件 (app.py/server.js/index.js/main.py)" >> logs/start.log
    echo "[$(date)] 请在 project 目录添加 Web 应用代码" >> logs/start.log
fi

echo "[$(date)] 启动脚本执行完成" >> logs/start.log
