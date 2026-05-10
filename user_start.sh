#!/bin/bash
# Hermit-Claw Web App 8082 启动脚本
# 日志输出到 logs/start.log

set -e

LOG_FILE="/home/agent/.claude/workspace/project/logs/start.log"
PROJECT_DIR="/home/agent/.claude/workspace/project"

# 确保在项目目录
cd "$PROJECT_DIR"

# 确保日志目录存在
mkdir -p logs

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ============================================
# 清理旧进程
# ============================================
log "========================================="
log "启动 Web App 8082"
log "========================================="
log "检查并清理旧进程..."

# 使用 fuser 清理占用 8082 端口的进程
fuser -k 8082/tcp 2>/dev/null || true
sleep 1

# 备用清理方式
pkill -9 -f "node.*server.js" 2>/dev/null || true
sleep 1

# 验证端口已释放
if fuser 8082/tcp 2>/dev/null; then
    log "警告: 端口 8082 仍被占用，强制清理..."
    fuser -k -9 8082/tcp 2>/dev/null || true
    sleep 2
fi

log "工作目录: $(pwd)"

# ============================================
# 启动服务器
# ============================================
log "启动 Node.js 服务器 (端口8082)..."

# 使用 nohup 确保后台运行，并捕获输出到日志
nohup node server.js >> logs/run.log 2>&1 &
SERVER_PID=$!

log "启动进程 PID: $SERVER_PID"

# ============================================
# 等待并验证启动
# ============================================
log "等待服务器启动..."
for i in {1..10}; do
    sleep 1

    # 检查进程是否还在运行
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        log "错误: 进程 $SERVER_PID 已退出"
        log "查看 run.log 获取详情:"
        tail -20 logs/run.log | tee -a "$LOG_FILE"
        exit 1
    fi

    # 检查 HTTP 响应
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        log "✓ Web 服务器启动成功 (PID: $SERVER_PID)"
        log "监听地址: http://0.0.0.0:8082"
        log "服务地址: http://localhost:8082/"

        # ============================================
        # 启动定时任务：每30分钟更新 sidebar.html
        # ============================================
        log "启动定时任务：每30分钟更新 sidebar.html..."

        (
            while true; do
                sleep 1800  # 30分钟
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8082/api/travel/generate \
                    -H "Content-Type: application/json" \
                    -d '{"schedules":[]}' 2>/dev/null || echo "000")
                if [ "$HTTP_CODE" = "200" ]; then
                    log "[cron] sidebar.html 已更新"
                else
                    log "[cron] 服务器无响应 (HTTP: $HTTP_CODE)"
                fi
            done
        ) &
        CRON_PID=$!
        log "定时任务已启动 (PID: $CRON_PID)"

        log "启动脚本执行完成"
        exit 0
    fi

    log "等待中... ($i/10) HTTP状态: $HTTP_CODE"
done

# 超时处理
log "错误: 服务器启动超时 (HTTP状态: $HTTP_CODE)"
log "查看 run.log 获取详情:"
tail -20 logs/run.log | tee -a "$LOG_FILE"

# 如果进程还在，尝试杀掉它
kill -9 $SERVER_PID 2>/dev/null || true

exit 1
