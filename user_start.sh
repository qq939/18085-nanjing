#!/bin/bash
set -e

LOG_FILE="/home/agent/.claude/workspace/project/logs/start.log"
PROJECT_DIR="/home/agent/.claude/workspace/project"

cd "$PROJECT_DIR"
mkdir -p logs

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "启动 Web App 8082 (React + Vite)"
log "========================================="

# 清理旧进程
fuser -k 8082/tcp 2>/dev/null || true
pkill -9 -f "node.*server.js" 2>/dev/null || true
pkill -9 -f "vite" 2>/dev/null || true
sleep 1

log "安装依赖..."
npm install

log "启动 Vite 开发服务器..."
nohup npm start > logs/run.log 2>&1 &
SERVER_PID=$!
log "启动进程 PID: $SERVER_PID"

log "等待服务器启动..."
for i in {1..15}; do
    sleep 1
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        log "✓ Web 服务器启动成功 (PID: $SERVER_PID)"
        log "服务地址: http://localhost:8082/"
        log "启动脚本执行完成"
        exit 0
    fi
    log "等待中... ($i/15) HTTP状态: $HTTP_CODE"
done

log "错误: 服务器启动超时"
tail -20 logs/run.log | tee -a "$LOG_FILE"
exit 1
