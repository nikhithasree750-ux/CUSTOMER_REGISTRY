const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const DIST_DIR = path.join(__dirname, 'dist');
const PREFIX = '/CUSTOMER_REGISTRY';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers for API calls if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // Handle root redirect to base prefix
  if (req.url === '/' || req.url === PREFIX) {
    res.writeHead(302, { 'Location': `${PREFIX}/` });
    return res.end();
  }

  // Serve static files under /CUSTOMER_REGISTRY/
  if (req.url.startsWith(PREFIX)) {
    let relativePath = req.url.slice(PREFIX.length);
    relativePath = relativePath.split('?')[0]; // strip query string

    if (relativePath.endsWith('/') || relativePath === '') {
      relativePath = path.join(relativePath, 'index.html');
    }

    let filePath = path.join(DIST_DIR, relativePath);

    // Check if path is outside dist (security)
    const relativePathFromDist = path.relative(DIST_DIR, filePath);
    if (relativePathFromDist.startsWith('..') || path.isAbsolute(relativePathFromDist)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback to index.html
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    }
  } else {
    // Redirect unknown paths to prefix index
    res.writeHead(302, { 'Location': `${PREFIX}/` });
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Client Dev Server is running`);
  console.log(`Access local client at: http://localhost:${PORT}/CUSTOMER_REGISTRY/`);
  console.log(`==================================================`);
});
