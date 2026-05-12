const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8082;
const CSV_PATH = path.join(__dirname, 'schedules.csv');
const DIST_PATH = path.join(__dirname, 'dist');

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const schedules = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const s = {};
    headers.forEach((h, idx) => {
      s[h] = (values[idx] || '').trim().replace(/^"|"$/g, '');
    });
    schedules.push(s);
  }
  return schedules;
}

function saveCSV(schedules) {
  const headers = ['id', 'title', 'description', 'start_time', 'end_time', 'created_at', 'updated_at'];
  const lines = [headers.join(',')];
  schedules.forEach(s => {
    const values = headers.map(h => {
      const v = s[h] || '';
      return '"' + String(v).replace(/"/g, '""') + '"';
    });
    lines.push(values.join(','));
  });
  fs.writeFileSync(CSV_PATH, lines.join('\n'));
}

function serveStaticFile(res, filePath) {
  const fullPath = path.join(DIST_PATH, filePath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(fs.readFileSync(fullPath));
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/schedules' && req.method === 'GET') {
    try {
      if (!fs.existsSync(CSV_PATH)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      const csv = fs.readFileSync(CSV_PATH, 'utf8');
      const schedules = parseCSV(csv);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(schedules));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (url.pathname === '/api/schedules' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { schedules } = JSON.parse(body);
        saveCSV(schedules || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(indexPath));
      return;
    }
  }

  const staticFile = url.pathname.substring(1);
  if (serveStaticFile(res, staticFile)) return;
  if (serveStaticFile(res, 'index.html')) return;

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 服务已启动 (0.0.0.0:${PORT})`);
  console.log(`  - API: /api/schedules`);
  console.log(`  - 静态: ${DIST_PATH}`);
});