import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
const cwd=fileURLToPath(new URL('../',import.meta.url));
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const child=spawn(process.execPath,['--import','tsx','server/workspace-mcp.ts'],{cwd,stdio:'inherit',env:{...process.env,RESUME_PRINT_URL:'http://127.0.0.1:5175',...(existsSync(chrome)?{CHROME_EXECUTABLE:chrome}:{})}});
process.on('SIGTERM',()=>child.kill('SIGTERM'));process.on('SIGINT',()=>child.kill('SIGINT'));child.on('exit',code=>process.exit(code??0));
