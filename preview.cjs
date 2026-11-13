const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const base = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(base,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}
    fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(error?'Not found':data);});
  }catch{res.writeHead(400);res.end();}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
