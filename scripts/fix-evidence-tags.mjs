import fs from 'node:fs';import path from 'node:path';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const p of walk('src/templates/resume/variants').filter(p=>p.endsWith('.tsx'))){let s=fs.readFileSync(p,'utf8');s=s.split('\n').map(l=>l.includes('value={edu.school}')&&l.includes('<EvidenceLink')?l.replace('<E ','<><E ').replace('<EvidenceLink url={edu.url}/>','<EvidenceLink url={edu.url}/></>'):l).join('\n');fs.writeFileSync(p,s);}
