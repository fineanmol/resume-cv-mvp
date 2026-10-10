import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';

process.env.STUDIO_NO_LISTEN='1';
const { studioApp }=await import('./studio');

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const port=Number(process.env.PORT||8780);
const hostname=process.env.HOST||'127.0.0.1';
if(process.env.STUDIO_ALLOWED_ORIGINS===undefined)process.env.STUDIO_ALLOWED_ORIGINS=process.env.PUBLIC_ORIGIN||`http://${hostname}:${port}`;
const types:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mjs':'text/javascript; charset=utf-8'};

async function assetPath(requestPath:string):Promise<string>{
  let decoded:string;
  try{decoded=decodeURIComponent(requestPath);}catch{return path.join(dist,'index.html');}
  const relative=decoded.replace(/^\/+/,''),candidate=path.resolve(dist,relative);
  if(candidate!==dist&&!candidate.startsWith(dist+path.sep))return path.join(dist,'index.html');
  try{if((await stat(candidate)).isFile())return candidate;}catch{/* SPA fallback below */}
  return path.join(dist,decoded==='/print.html'?'print.html':'index.html');
}

async function fetch(request:Request):Promise<Response>{
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/v2'))return studioApp.fetch(request);
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Not found',{status:404});
  const file=await assetPath(url.pathname),contentType=types[path.extname(file).toLowerCase()]||'application/octet-stream';
  if(request.method==='HEAD')return new Response(null,{headers:{'Content-Type':contentType}});
  return new Response(createReadStream(file) as unknown as BodyInit,{headers:{'Content-Type':contentType,'Cache-Control':url.pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache'}});
}

await stat(path.join(dist,'index.html')).catch(()=>{throw new Error('Production build missing. Run `npm run build` before `npm start`.');});
serve({fetch,port,hostname});
console.log(`Production app ready on http://${hostname}:${port}`);
