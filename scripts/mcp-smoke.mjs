import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
const client=new Client({name:'workspace-acceptance',version:'1'});
const transport=new StdioClientTransport({command:process.execPath,args:['--import','tsx','server/workspace-mcp.ts'],env:{...process.env,RESUME_PRINT_URL:'http://127.0.0.1:5175',CHROME_EXECUTABLE:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}});
try{await client.connect(transport);const tools=await client.listTools();assert.equal(tools.tools.length,8);const p=await client.callTool({name:'list_profiles',arguments:{}});assert(!p.isError);console.log('MCP handshake and eight tools verified; profile listing passed.');
 const invalid=await client.callTool({name:'validate_document',arguments:{kind:'resume',documentJson:'{}'}});assert(JSON.parse(invalid.content[0].text).valid===false);console.log('MCP invalid-document validation passed.');
 if(process.argv.includes('--templates')){const result=await client.callTool({name:'validate_templates',arguments:{}},undefined,{timeout:300000});if(result.isError)throw new Error(result.content[0].text);const report=JSON.parse(result.content[0].text);console.log(JSON.stringify(report.reports.map(({kind,template,fixture,pages,a4})=>({kind,template,fixture,pages,a4})),null,2));}
}finally{await client.close();await transport.close();}
