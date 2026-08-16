#!/usr/bin/env node
/**
 * 零依赖的 Node 静态文件服务器。
 * 等价于 python3 -m http.server,但统一到 Node 工具链。
 *
 * 用法:
 *   node server.mjs              # 默认 8000 端口
 *   node server.mjs 9000         # 指定端口
 *   PORT=9000 node server.mjs    # 或用环境变量
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8000);
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    // 安全:防止路径穿越
    const urlPath = decodeURIComponent(new URL(req.url, `http://localhost`).pathname);
    const filePath = normalize(join(ROOT, urlPath));

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const stats = await stat(filePath);

    // 目录 → index.html
    const target = stats.isDirectory() ? join(filePath, 'index.html') : filePath;
    const data = await readFile(target);
    const type = MIME[extname(target)] ?? 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    }
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Me — Three.js Scroll Story`);
  console.log(`  ▸ 本地:   http://127.0.0.1:${PORT}/index.html`);
  console.log(`  ▸ 端口:   ${PORT}`);
  console.log(`  ▸ 目录:   ${ROOT}\n`);
});

// 优雅退出
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close();
    process.exit(0);
  });
}
