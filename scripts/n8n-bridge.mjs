// Optional authenticated bridge for Docker Desktop n8n -> loopback profile API.
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
const token=process.env.N8N_BRIDGE_TOKEN;
if(!token||token.length<32)throw new Error('Set N8N_BRIDGE_TOKEN to a random secret of at least 32 characters.');
http.createServer((req,res)=>{
 const actual=Buffer.from(req.headers.authorization||'');const wanted=Buffer.from('Bearer '+token);
 if(actual.length!==wanted.length||!timingSafeEqual(actual,wanted)){res.writeHead(401);res.end('Unauthorized');return;}
 const oldRoute=/^\/api\/v2\/(generate$|jobs\/[a-f0-9]{32}\/(resume\.pdf|master-resume\.json)$)/.test(req.url||'');
 const workspaceRoute=/^\/api\/v2\/workspace\/(generate$|profiles\/[a-z0-9-]{1,64}\/artifacts\/[a-f0-9-]{36}\/(resume|coverletter)\.pdf$)/.test(req.url||'');
 if(!(oldRoute||workspaceRoute)||!['GET','POST'].includes(req.method||'')){res.writeHead(404);res.end();return;}
 const upstream=http.request({hostname:'127.0.0.1',port:8793,path:req.url,method:req.method,headers:{'content-type':'application/json',...(process.env.STUDIO_API_TOKEN?{authorization:'Bearer '+process.env.STUDIO_API_TOKEN}:{})}},r=>{res.writeHead(r.statusCode||502,r.headers);r.pipe(res);});
 upstream.on('error',()=>{res.writeHead(502);res.end('Profile API unavailable');});req.pipe(upstream);
}).listen(8794,'0.0.0.0',()=>console.log('Authenticated n8n bridge on port 8794'));
