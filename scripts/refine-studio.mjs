import {readFileSync,writeFileSync} from 'node:fs';
const file='src/studio/Studio.tsx';let s=readFileSync(file,'utf8');
s=s.replace("import './studio.css';","import './studio.css';\nimport { ProfileSections, SkillsInput } from './ProfileSections';");
s=s.replace('<textarea value={g.items.join(\', \')} onChange={e=>update({skills:profile.skills.map((a,j)=>j===i?{...a,items:e.target.value.split(\',\').map(x=>x.trim()).filter(Boolean)}:a)})}/>','<SkillsInput items={g.items} onChange={items=>update({skills:profile.skills.map((a,j)=>j===i?{...a,items}:a)})}/>');
const begin=s.indexOf(' <details><summary>Education, projects & achievements');const end=s.indexOf('\n+ ',begin);
if(begin>=0){const next=s.indexOf('\n+ ',begin);void next;const finish=s.indexOf('\n <details><summary>Import',begin);if(finish<0)throw new Error('Section boundary missing');s=s.slice(0,begin)+' <ProfileSections profile={profile} onChange={update}/>'+s.slice(finish);}
void end;writeFileSync(file,s);
