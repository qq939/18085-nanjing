#!/bin/bash
set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_FILE="$PROJECT_DIR/logs/start.log"
cd "$PROJECT_DIR"

mkdir -p logs

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "启动日程管理系统 (Node.js 单端口服务)"
log "工作目录: $PROJECT_DIR"
log "========================================="

# 1. 初始化同步：从 Supabase 拉取数据到本地 schedules.csv
log "步骤 1: 初始化同步 (Supabase -> CSV)..."
python3 "$PROJECT_DIR/sync_to_supabase.py" --pull | tee -a "$LOG_FILE"

# 2. 清理旧进程
log "步骤 2: 清理旧进程..."
pkill -9 -f "node.*server.cjs" 2>/dev/null || true
pkill -9 -f "vite" 2>/dev/null || true
pkill -9 -f "node.*api_server" 2>/dev/null || true
pkill -9 -f "python3.*sync_to_supabase" 2>/dev/null || true
pkill -9 -f "python3.*generate_sidebar" 2>/dev/null || true
if lsof -ti :8082 >/dev/null; then
    lsof -ti :8082 | xargs kill -9 2>/dev/null || true
fi
if lsof -ti :8083 >/dev/null; then
    lsof -ti :8083 | xargs kill -9 2>/dev/null || true
fi
sleep 2

# 3. 确保构建存在
if [ ! -f "$PROJECT_DIR/dist/index.html" ]; then
    log "步骤 3: 正在构建前端..."
    npm run build >> "$LOG_FILE" 2>&1
fi

# 4. 启动主服务 (Node.js 单端口：8082 同时提供 API 和静态文件)
log "步骤 4: 启动 Node.js 服务器 (0.0.0.0:8082)..."
nohup node "$PROJECT_DIR/server.cjs" >> "$PROJECT_DIR/logs/run.log" 2>&1 &
SERVER_PID=$!
log "服务器 PID: $SERVER_PID"
sleep 3

# 5. 启动定时同步任务 (每分钟同步到 Supabase)
log "步骤 5: 启动定时同步任务 (CSV -> Supabase)..."
nohup python3 "$PROJECT_DIR/sync_to_supabase.py" >> "$PROJECT_DIR/logs/sync.log" 2>&1 &
SYNC_PID=$!
log "同步任务 PID: $SYNC_PID"

# 6. 启动侧边栏生成任务 (每小时生成一次)
log "步骤 6: 启动侧边栏生成任务 (Claude CLI)..."
nohup python3 "$PROJECT_DIR/generate_sidebar.py" >> "$PROJECT_DIR/logs/sidebar.log" 2>&1 &
SIDEBAR_PID=$!
log "侧边栏生成 PID: $SIDEBAR_PID"

# 验证服务在线
log "验证服务状态..."
for i in {1..15}; do
    sleep 1
    if curl -sf http://localhost:8082/ > /dev/null 2>&1; then
        log "✓ 系统启动成功 (0.0.0.0:8082)"
        log "  - API + 静态文件服务: http://localhost:8082"
        log "========================================="
        exit 0
    fi
    log "等待中... ($i/15)"
done

log "❌ 服务启动失败，请检查 logs/run.log"
exit 1