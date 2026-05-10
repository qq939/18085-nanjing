const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const PORT = 8082;
const DIST_DIR = __dirname;

// Supabase 直连配置（从环境变量读取）
const DATABASE_URL = process.env.DATABASE_URL ||
    'postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

// 创建 PostgreSQL 连接池
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
};

// 记录运行日志
function logRun(message) {
    const logDir = path.join(DIST_DIR, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(path.join(logDir, 'run.log'), `[${new Date().toISOString()}] ${message}\n`);
}

// 解析请求体
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// 返回 JSON 响应
function jsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API 路由处理
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // 日程 API
    if (pathname === '/api/schedules') {
        try {
            if (req.method === 'GET') {
                // 获取所有日程
                const result = await pool.query(
                    'SELECT id, title, description, start_time, end_time, created_at, updated_at FROM schedules ORDER BY start_time ASC'
                );
                jsonResponse(res, 200, { success: true, data: result.rows });
                logRun(`GET /api/schedules - 返回 ${result.rows.length} 条记录`);

            } else if (req.method === 'POST') {
                // 创建日程
                const body = await parseBody(req);
                const { title, description, start_time, end_time } = body;

                if (!title || !start_time || !end_time) {
                    jsonResponse(res, 400, { success: false, error: '缺少必填字段' });
                    return;
                }

                // 检查时间冲突
                const conflictCheck = await pool.query(
                    `SELECT id, title FROM schedules
                     WHERE start_time < $2::TIMESTAMPTZ AND end_time > $1::TIMESTAMPTZ
                     LIMIT 5`,
                    [start_time, end_time]
                );

                if (conflictCheck.rows.length > 0) {
                    jsonResponse(res, 409, {
                        success: false,
                        error: '时间冲突',
                        conflicts: conflictCheck.rows
                    });
                    logRun(`POST /api/schedules - 时间冲突: ${JSON.stringify(conflictCheck.rows)}`);
                    return;
                }

                const result = await pool.query(
                    `INSERT INTO schedules (title, description, start_time, end_time)
                     VALUES ($1::TEXT, $2::TEXT, $3::TIMESTAMPTZ, $4::TIMESTAMPTZ)
                     RETURNING id, title, description, start_time, end_time, created_at, updated_at`,
                    [title, description || '', start_time, end_time]
                );

                jsonResponse(res, 201, { success: true, data: result.rows[0] });
                logRun(`POST /api/schedules - 创建成功: ${result.rows[0].id}`);

            } else {
                jsonResponse(res, 405, { success: false, error: 'Method not allowed' });
            }
        } catch (error) {
            logRun(`API Error: ${error.message}`);
            jsonResponse(res, 500, { success: false, error: error.message });
        }

    } else if (pathname.startsWith('/api/schedules/') && req.method === 'PUT') {
        // 更新日程
        try {
            const id = pathname.split('/')[3];
            const body = await parseBody(req);
            const { title, description, start_time, end_time } = body;

            // 检查时间冲突（排除自己）
            const conflictCheck = await pool.query(
                `SELECT id, title FROM schedules
                 WHERE start_time < $2::TIMESTAMPTZ AND end_time > $1::TIMESTAMPTZ AND id != $3::UUID
                 LIMIT 5`,
                [start_time, end_time, id]
            );

            if (conflictCheck.rows.length > 0) {
                jsonResponse(res, 409, {
                    success: false,
                    error: '时间冲突',
                    conflicts: conflictCheck.rows
                });
                return;
            }

            const result = await pool.query(
                `UPDATE schedules
                 SET title = $1::TEXT, description = $2::TEXT, start_time = $3::TIMESTAMPTZ, end_time = $4::TIMESTAMPTZ, updated_at = NOW()
                 WHERE id = $5::UUID
                 RETURNING id, title, description, start_time, end_time, created_at, updated_at`,
                [title, description || '', start_time, end_time, id]
            );

            if (result.rows.length === 0) {
                jsonResponse(res, 404, { success: false, error: '日程不存在' });
                return;
            }

            jsonResponse(res, 200, { success: true, data: result.rows[0] });
            logRun(`PUT /api/schedules/${id} - 更新成功`);
        } catch (error) {
            logRun(`API Error: ${error.message}`);
            jsonResponse(res, 500, { success: false, error: error.message });
        }

    } else if (pathname.startsWith('/api/schedules/') && req.method === 'DELETE') {
        // 删除日程
        try {
            const id = pathname.split('/')[3];
            const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING id', [id]);

            if (result.rows.length === 0) {
                jsonResponse(res, 404, { success: false, error: '日程不存在' });
                return;
            }

            jsonResponse(res, 200, { success: true, data: { id } });
            logRun(`DELETE /api/schedules/${id} - 删除成功`);
        } catch (error) {
            logRun(`API Error: ${error.message}`);
            jsonResponse(res, 500, { success: false, error: error.message });
        }

    } else if (pathname === '/api/travel/generate' && req.method === 'POST') {
        // 生成旅行规划
        try {
            const body = await parseBody(req);
            const { schedules } = body;

            // 将日程数据写入临时文件供 Claude 读取
            const inputData = JSON.stringify(schedules, null, 2);
            fs.writeFileSync(path.join(DIST_DIR, 'travel_input.json'), inputData);

            // 调用 Claude CLI 生成旅行规划
            const { spawn } = require('child_process');
            const claude = spawn('claude', [
                '--dangerously-skip-permissions',
                '--print'
            ], {
                cwd: DIST_DIR,
                env: { ...process.env }
            });

            let claudeOutput = '';
            claude.stdin.write(`根据以下日程数据，生成旅行规划 sidebar.html 文件。

日程数据:
${schedules.map(s => `- ${s.title}: ${s.start_time} ~ ${s.end_time}${s.description ? ' (' + s.description + ')' : ''}`).join('\n')}

要求：
1. 生成小红书风格的旅行规划，包含真实图片链接
2. 格式适配第三栏宽度（380px），字体适中
3. 包含交通建议、餐饮推荐、住宿建议、景点攻略
4. 直接写入 /home/agent/.claude/workspace/project/sidebar.html
5. 使用 Unsplash 或类似图床获取真实图片
6. 布局要美观，类似小红书笔记风格

完成后输出"旅行规划已生成"。
`);
            claude.stdin.end();

            claude.stdout.on('data', (data) => {
                claudeOutput += data.toString();
            });

            claude.on('close', (code) => {
                logRun(`旅行规划生成完成: ${code === 0 ? '成功' : '失败'}`);
            });

            jsonResponse(res, 200, { success: true, message: '旅行规划生成中...' });
        } catch (error) {
            logRun(`旅行规划生成失败: ${error.message}`);
            jsonResponse(res, 500, { success: false, error: error.message });
        }

    } else {
        // 静态文件服务
        let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'text/plain; charset=utf-8';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end('<h1>404 - 文件未找到</h1>');
                    logRun(`404: ${pathname}`);
                } else {
                    res.writeHead(500);
                    res.end('服务器错误: ' + err.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    }
});

// 启动服务器
server.listen(PORT, '0.0.0.0', async () => {
    const msg = `[${new Date().toISOString()}] Web 服务器已启动，监听 0.0.0.0:${PORT}`;
    console.log(msg);
    logRun(msg);

    // 测试数据库连接
    try {
        await pool.query('SELECT 1');
        logRun('数据库连接成功');
    } catch (error) {
        logRun(`数据库连接失败: ${error.message}`);
    }
});

module.exports = server;