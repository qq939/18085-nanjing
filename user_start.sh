#!/bin/bash
set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_FILE="$PROJECT_DIR/logs/start.log"
PYTHON_BIN="$PROJECT_DIR/.venv/bin/python"
cd "$PROJECT_DIR"

export PATH="$PROJECT_DIR/.venv/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
export PYTHONPATH="$PROJECT_DIR/.python-packages:${PYTHONPATH:-}"
export PYTHONUNBUFFERED=1
mkdir -p logs
export npm_config_cache="$PROJECT_DIR/logs/npm-cache"
export PIP_CACHE_DIR="$PROJECT_DIR/logs/pip-cache"
mkdir -p "$npm_config_cache"
mkdir -p "$PIP_CACHE_DIR" "$PROJECT_DIR/.python-packages"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "启动日程管理系统 (Vite + CSV + Supabase Sync)"
log "工作目录: $PROJECT_DIR"
log "========================================="

if [ ! -x "$PYTHON_BIN" ]; then
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_BIN="$(command -v python3)"
    elif command -v python >/dev/null 2>&1; then
        PYTHON_BIN="$(command -v python)"
    else
        PYTHON_BIN=""
    fi
fi
log "Python: ${PYTHON_BIN:-未找到，跳过 Python 同步任务}"

if [ -n "$PYTHON_BIN" ] && [ -f "$PROJECT_DIR/requirements.txt" ]; then
    if ! "$PYTHON_BIN" -c "import psycopg2" >/dev/null 2>&1; then
        log "检测到 Python 依赖缺失，正在安装 requirements.txt..."
        "$PYTHON_BIN" -m pip install --target "$PROJECT_DIR/.python-packages" -r "$PROJECT_DIR/requirements.txt" >> "$LOG_FILE" 2>&1 || \
            log "⚠️ Python 依赖安装失败，将继续尝试启动"
    fi
fi

if [ ! -d "$PROJECT_DIR/node_modules/@rollup/rollup-linux-arm64-gnu" ] && [ "$(uname -m)" = "aarch64" ]; then
    log "检测到容器缺少 Rollup Linux ARM64 包，正在补齐 npm optional dependency..."
    npm install --no-save @rollup/rollup-linux-arm64-gnu >> "$LOG_FILE" 2>&1 || log "⚠️ Rollup Linux 包安装失败，将继续尝试启动"
fi

log "步骤 1: 初始化同步 (Supabase schedules/arrows -> CSV)..."
if [ -n "$PYTHON_BIN" ]; then
    "$PYTHON_BIN" "$PROJECT_DIR/sync_to_supabase.py" --pull | tee -a "$LOG_FILE"
else
    log "跳过初始化同步：容器内没有可用 Python"
fi

log "步骤 2: 清理旧进程..."
pgrep -f "node .*server.cjs" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
pgrep -f "node $PROJECT_DIR/api_server.js" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
pgrep -f "$PROJECT_DIR/node_modules/.bin/vite --host 0.0.0.0 --port 8082" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
pgrep -f "$PROJECT_DIR/sync_to_supabase.py" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
pgrep -f "$PROJECT_DIR/generate_sidebar.py" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
sleep 2

log "步骤 3: 构建 TS + Vite 前端..."
npm run build >> "$LOG_FILE" 2>&1

log "步骤 4: 后台启动 Web + CSV API 服务 (0.0.0.0:8082)..."
nohup npm run start >> "$PROJECT_DIR/logs/run.log" 2>&1 &
WEB_PID=$!
log "Web 服务 PID: $WEB_PID"

log "步骤 5: 启动每分钟 CSV -> Supabase 覆盖同步任务..."
if [ -n "$PYTHON_BIN" ]; then
    nohup "$PYTHON_BIN" "$PROJECT_DIR/sync_to_supabase.py" >> "$PROJECT_DIR/logs/sync.log" 2>&1 &
    SYNC_PID=$!
    log "同步任务 PID: $SYNC_PID"
else
    log "跳过同步任务：容器内没有可用 Python"
fi

log "步骤 6: 启动每小时 Claude CLI sidebar.html 生成任务..."
if [ -n "$PYTHON_BIN" ]; then
    nohup "$PYTHON_BIN" "$PROJECT_DIR/generate_sidebar.py" >> "$PROJECT_DIR/logs/sidebar.log" 2>&1 &
    SIDEBAR_PID=$!
    log "侧边栏生成 PID: $SIDEBAR_PID"
else
    log "跳过侧边栏生成任务：容器内没有可用 Python"
fi

log "验证服务状态..."
for i in {1..20}; do
    sleep 1
    if curl -sf http://localhost:8082/ >/dev/null 2>&1 && curl -sf http://localhost:8082/api/schedules >/dev/null 2>&1; then
        log "✓ 系统启动成功"
        log "  - Web: http://localhost:8082/"
        log "  - API: http://localhost:8082/api/schedules, /api/arrows, /api/sidebar"
        log "========================================="
        exit 0
    fi
    log "等待中... ($i/20)"
done

log "❌ 服务启动失败，请检查 logs/run.log 和 logs/api.log"
exit 1
