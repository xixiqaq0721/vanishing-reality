// 极简静态服务器：给离线预览页提供 http:// 源，否则页面里的动态 import
// 会撞上 file:// 的 CORS 限制。
//   /            -> tools/preview/*
//   /vendor/zod/* -> node_modules/zod/*  （预览用的 zod 与构建版本一致）
// 用法：node tools/serve.cjs [端口]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.argv[2] || 5599);
const previewRoot = path.resolve(__dirname, 'preview');
const zodRoot = path.resolve(__dirname, '..', 'node_modules', 'zod');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

function resolveTarget(urlPath) {
  const rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel.startsWith('/vendor/zod/')) {
    const sub = rel.slice('/vendor/zod/'.length);
    const p = path.join(zodRoot, sub);
    return p.startsWith(zodRoot) ? p : null;
  }
  const p = path.join(previewRoot, rel === '/' ? 'index.html' : rel);
  return p.startsWith(previewRoot) ? p : null;
}

http
  .createServer((req, res) => {
    // 宿主页把量测结果回传，落盘成机器可读证据（?name=xxx 指定文件名）
    if (req.method === 'POST' && (req.url || '').split('?')[0] === '/report') {
      const q = new URLSearchParams((req.url || '').split('?')[1] || '');
      const name = (q.get('name') || 'iframe').replace(/[^a-zA-Z0-9_-]/g, '');
      let chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        try {
          // 用 Buffer 拼接再一次性解码：逐块 toString 会在多字节字符跨块处解坏
          const body = Buffer.concat(chunks).toString('utf8');
          fs.writeFileSync(path.join(previewRoot, name + '-report.json'), body, 'utf8');
          console.log(name + ' report written (' + body.length + ' B)');
        } catch (e) {
          console.log('report write failed: ' + e.message);
        }
        res.writeHead(204).end();
      });
      return;
    }

    const target = resolveTarget(req.url || '/');
    if (!target) {
      res.writeHead(403).end('forbidden');
      return;
    }
    fs.readFile(target, (err, buf) => {
      if (err) {
        res.writeHead(404).end('not found: ' + req.url);
        return;
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(buf);
    });
  })
  .listen(PORT, '127.0.0.1', () => console.log('preview server on http://127.0.0.1:' + PORT + '/'));
