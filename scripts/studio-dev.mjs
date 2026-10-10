import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const env={...process.env,...(existsSync(chrome)?{CHROME_EXECUTABLE:chrome}:{})};
const children=[spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit',env}),spawn(process.execPath,['--import','tsx','server/studio.ts'],{stdio:'inherit',env})];
const stop=()=>{children.forEach(c=>c.kill('SIGTERM'));setTimeout(()=>children.forEach(c=>c.kill('SIGKILL')),1500).unref();};
process.on('SIGINT',stop);process.on('SIGTERM',stop);
children.forEach(c=>c.on('exit',code=>{if(code) {stop();process.exitCode=code;}}));
