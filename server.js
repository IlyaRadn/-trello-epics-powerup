/*
 * server.js — zero-dependency static file server for local development.
 * Serves the project root over HTTP so the Power-Up pages and the test
 * harness can load with proper relative paths. Usage: `node server.js`
 */
'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var PORT = process.env.PORT || 5050;

var TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

http.createServer(function (req, res) {
  var urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  var filePath = path.join(ROOT, path.normalize(urlPath));

  // Prevent path traversal outside ROOT.
  if (filePath.indexOf(ROOT) !== 0) { res.writeHead(403); return res.end('Forbidden'); }

  fs.readFile(filePath, function (err, data) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found: ' + urlPath); }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, function () {
  console.log('Dev server running at http://localhost:' + PORT + '/');
  console.log('  Power-Up connector: http://localhost:' + PORT + '/index.html');
  console.log('  Test harness:       http://localhost:' + PORT + '/test/harness.html');
});
