#!/bin/bash
set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_FILE="$PROJECT_DIR/logs/start.log"
PYTHON_BIN="$PROJECT_DIR/.venv/bin/python"
cd "$PROJECT_DIR"

mkdir -p logs

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "启动日程管理系统 (Vite + CSV + Supabase Sync)"
log "工作目录: $PROJECT_DIR"
log "========================================="

if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi
log "Python: $PYTHON_BIN"

log "步骤 1: 初始化同步 (Supabase schedules/arrows -> CSV)..."
"$PYTHON_BIN" "$PROJECT_DIR/sync_to_supabase.py" --pull | tee -a "$LOG_FILE"

log "步骤 2: 清理旧进程..."
pkill -9 -f "node.*api_server.js" 2>/dev/null || true
pkill -9 -f "vite.*8082" 2>/dev/null || true
pkill -9 -f "python3.*sync_to_supabase.py" 2>/dev/null || true
pkill -9 -f "python3.*generate_sidebar.py" 2>/dev/null || true
if lsof -ti :8082 >/dev/null; then
    lsof -ti :8082 | xargs kill -9 2>/dev/null || true
fi
if lsof -ti :8083 >/dev/null; then
    lsof -ti :8083 | xargs kill -9 2>/dev/null || true
fi
sleep 2

log "步骤 3: 启动本地 CSV API (127.0.0.1:8083)..."
nohup node "$PROJECT_DIR/api_server.js" >> "$PROJECT_DIR/logs/api.log" 2>&1 &
API_PID=$!
log "CSV API PID: $API_PID"

log "步骤 4: 后台启动 TS + Vite Web 服务 (0.0.0.0:8082)..."
nohup npm run start >> "$PROJECT_DIR/logs/run.log" 2>&1 &
VITE_PID=$!
log "Vite PID: $VITE_PID"

log "步骤 5: 启动每分钟 CSV -> Supabase 覆盖同步任务..."
nohup "$PYTHON_BIN" "$PROJECT_DIR/sync_to_supabase.py" >> "$PROJECT_DIR/logs/sync.log" 2>&1 &
SYNC_PID=$!
log "同步任务 PID: $SYNC_PID"

log "步骤 6: 启动每小时 Claude CLI sidebar.html 生成任务..."
nohup "$PYTHON_BIN" "$PROJECT_DIR/generate_sidebar.py" >> "$PROJECT_DIR/logs/sidebar.log" 2>&1 &
SIDEBAR_PID=$!
log "侧边栏生成 PID: $SIDEBAR_PID"

log "验证服务状态..."
for i in {1..20}; do
    sleep 1
    if curl -sf http://localhost:8082/ >/dev/null 2>&1 && curl -sf http://localhost:8082/api/schedules >/dev/null 2>&1; then
        log "✓ 系统启动成功"
        log "  - Web: http://localhost:8082"
        log "  - API: http://localhost:8082/api/schedules, /api/arrows, /api/sidebar"
        log "========================================="
        exit 0
    fi
    log "等待中... ($i/20)"
done

log "❌ 服务启动失败，请检查 logs/run.log 和 logs/api.log"
exit 1
