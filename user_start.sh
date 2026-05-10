#!/bin/bash
# Hermit-Claw Web App 8082 启动脚本
# 日志输出到 logs/start.log

# 跳转到项目目录
cd /home/agent/.claude/workspace/project

# 确保日志目录存在
mkdir -p logs

# 清空旧日志（避免重复）
echo "========================================" > logs/start.log
echo "[$(date)] 启动 Web App 8082" >> logs/start.log
echo "========================================" >> logs/start.log

# 检查并清理旧的 node server.js 进程
echo "[$(date)] 检查并清理旧进程..." >> logs/start.log
pkill -f "node server.js" 2>/dev/null || true
sleep 1

# 记录启动信息
echo "[$(date)] 工作目录: $(pwd)" >> logs/start.log
echo "[$(date)] 启动 Node.js 静态文件服务器 (端口8082)" >> logs/start.log

# 启动服务器（后台运行）
node server.js >> logs/start.log 2>&1 &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 验证服务是否启动成功
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/ | grep -q "200"; then
    echo "[$(date)] ✓ Web 服务器启动成功 (PID: $SERVER_PID)" >> logs/start.log
    echo "[$(date)] 监听地址: http://0.0.0.0:8082" >> logs/start.log
    echo "[$(date)] 服务地址: http://localhost:8082/" >> logs/start.log
else
    echo "[$(date)] ✗ Web 服务器启动失败，请检查 logs/start.log" >> logs/start.log
    exit 1
fi

echo "[$(date)] 启动脚本执行完成" >> logs/start.log
