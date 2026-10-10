import {writeFile} from 'node:fs/promises';
import {toResume} from '../src/studio/model';
import {anmol} from '../src/studio/anmol';
import {HYBRID_STYLE_DEFAULTS} from '../src/config/hybridDefaults';
const state=toResume(anmol);state.layoutSettings={...state.layoutSettings,...HYBRID_STYLE_DEFAULTS};
const res=await fetch('http://127.0.0.1:5175/api/v2/workspace/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'resume',state}),signal:AbortSignal.timeout(150000)});
if(!res.ok)throw new Error(`${res.status}: ${await res.text()}`);
await writeFile('/Users/fineanmol/Documents/Codex/2026-10-04/i-x20/outputs/Anmol-Hybrid-Clean.pdf',Buffer.from(await res.arrayBuffer()));
console.log('Clean PDF exported successfully');
