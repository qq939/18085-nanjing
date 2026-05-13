const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8082;
const PROJECT_DIR = __dirname;
const DIST_PATH = path.join(PROJECT_DIR, 'dist');
const SIDEBAR_PATH = path.join(PROJECT_DIR, 'sidebar.html');

const DATASETS = {
  schedules: {
    csvPath: path.join(PROJECT_DIR, 'schedules.csv'),
    headers: ['id', 'title', 'description', 'start_time', 'end_time', 'created_at', 'updated_at'],
    bodyKey: 'schedules',
  },
  arrows: {
    csvPath: path.join(PROJECT_DIR, 'arrows.csv'),
    headers: ['id', 'source_schedule_id', 'source_side', 'target_schedule_id', 'target_side', 'created_at', 'updated_at'],
    bodyKey: 'arrows',
  },
};

function stripAppPrefix(pathname) {
  if (pathname === '/nanjing') return '/';
  if (pathname.startsWith('/nanjing/')) return pathname.slice('/nanjing'.length);
  return pathname;
}

function parseCSV(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some(value => value !== '')) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map(value => value.trim());
  return rows.slice(1).map(values => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    return record;
  });
}

function formatCSV(records, headers) {
  const escapeCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];

  records.forEach(record => {
    lines.push(headers.map(header => escapeCell(record[header])).join(','));
  });

  return `${lines.join('\n')}\n`;
}

function ensureCSV(dataset) {
  if (!fs.existsSync(dataset.csvPath)) {
    fs.writeFileSync(dataset.csvPath, `${dataset.headers.join(',')}\n`);
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error('请求体过大'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleDataset(req, res, dataset) {
  try {
    ensureCSV(dataset);

    if (req.method === 'GET') {
      const csv = fs.readFileSync(dataset.csvPath, 'utf8');
      sendJson(res, 200, parseCSV(csv));
      return;
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const payload = JSON.parse(body || '{}');
      const records = Array.isArray(payload[dataset.bodyKey]) ? payload[dataset.bodyKey] : [];
      fs.writeFileSync(dataset.csvPath, formatCSV(records, dataset.headers));
      sendJson(res, 200, { success: true, count: records.length });
      return;
    }

    sendJson(res, 405, { error: 'Method Not Allowed' });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

function serveStaticFile(res, pathname) {
  const cleanPath = pathname === '/' ? '/index.html' : pathname;
  const decodedPath = decodeURIComponent(cleanPath);
  const fullPath = path.normalize(path.join(DIST_PATH, decodedPath));

  if (!fullPath.startsWith(DIST_PATH) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return false;
  }

  const ext = path.extname(fullPath);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  res.end(fs.readFileSync(fullPath));
  return true;
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
  const pathname = stripAppPrefix(url.pathname);

  if (pathname === '/api/schedules') {
    handleDataset(req, res, DATASETS.schedules);
    return;
  }

  if (pathname === '/api/arrows') {
    handleDataset(req, res, DATASETS.arrows);
    return;
  }

  if (pathname === '/api/sidebar' && req.method === 'GET') {
    if (!fs.existsSync(SIDEBAR_PATH)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('sidebar.html not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(fs.readFileSync(SIDEBAR_PATH));
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  if (serveStaticFile(res, pathname)) return;
  serveStaticFile(res, '/index.html');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 服务已启动 (0.0.0.0:${PORT})`);
  console.log(`  - 静态: ${DIST_PATH}`);
  console.log('  - API: /api/schedules, /api/arrows, /api/sidebar');
  console.log('  - 兼容入口: / 和 /nanjing/');
});
