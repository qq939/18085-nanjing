#!/bin/bash
# 每30分钟自动生成旅行规划 sidebar.html
# 由 cron 调用: */30 * * * * /home/agent/.claude/workspace/project/update_sidebar.sh

PROJECT_DIR="/home/agent/.claude/workspace/project"
LOG_FILE="$PROJECT_DIR/logs/run.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [cron] $1" >> "$LOG_FILE"
}

cd "$PROJECT_DIR"

# 调用本地 API 触发生成（服务器必须在运行中）
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8082/api/travel/generate \
    -H "Content-Type: application/json" \
    -d '{"schedules":[]}')

if [ "$HTTP_CODE" = "200" ]; then
    log "定时任务: sidebar.html 已更新"
else
    log "定时任务: 服务器无响应 (HTTP: $HTTP_CODE)"
fi
