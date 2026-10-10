import {z} from 'zod';
export const providerSchema=z.enum(['openai','anthropic','gemini']);
export type Provider=z.infer<typeof providerSchema>;
export const modelSchema=z.string().trim().min(1).max(150).regex(/^[a-zA-Z0-9._:-]+$/);
const envNames={openai:'OPENAI_API_KEY',anthropic:'ANTHROPIC_API_KEY',gemini:'GEMINI_API_KEY'};
export const configuredProviders=()=>Object.entries(envNames).map(([id,key])=>({id,configured:!!process.env[key]}));
export function resolveKey(provider:Provider,apiKey?:string){const key=apiKey?.trim()||process.env[envNames[provider]];if(!key)throw new Error(`Enter a ${provider} API key or configure ${envNames[provider]} on the server.`);return key;}
function headers(provider:Provider,key:string){return {'Content-Type':'application/json',...(provider==='openai'?{Authorization:`Bearer ${key}`} :provider==='anthropic'?{'x-api-key':key,'anthropic-version':'2023-06-01'}:{'x-goog-api-key':key})};}
async function request(url:string,provider:Provider,key:string,body?:unknown){
 const response=await fetch(url,{method:body?'POST':'GET',headers:headers(provider,key),...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(90000),redirect:'error'});
 // Never surface provider bodies: they can echo source documents or credentials.
 if(!response.ok)throw new Error(`${provider} returned HTTP ${response.status}. Check key, model access and quota. No draft was saved.`);
 return response.json();
}
export async function listModels(provider:Provider,apiKey?:string){
 const key=resolveKey(provider,apiKey),result:{id:string;name:string}[]=[];let cursor='';
 for(let page=0;page<20;page++){
  const url=provider==='openai'?'https://api.openai.com/v1/models':provider==='anthropic'?'https://api.anthropic.com/v1/models?limit=100'+(cursor?'&after_id='+encodeURIComponent(cursor):''):'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'+(cursor?'&pageToken='+encodeURIComponent(cursor):'');
  const data=await request(url,provider,key);
  for(const m of data.data||data.models||[]){const id=(m.id||m.name||'').replace(/^models\//,'');if(provider==='gemini'&&!m.supportedGenerationMethods?.includes('generateContent'))continue;result.push({id,name:m.display_name||m.displayName||id});}
  cursor=provider==='anthropic'?(data.has_more?data.last_id:''):provider==='gemini'?(data.nextPageToken||''):'';
  if(!cursor)break;
 }
 return result;
}
export async function generateProse(provider:Provider,model:string,prompt:string,apiKey?:string){
 modelSchema.parse(model);const key=resolveKey(provider,apiKey);let text='';
 if(provider==='openai'){
  const d=await request('https://api.openai.com/v1/responses',provider,key,{model,input:prompt,store:false,max_output_tokens:6000});
  if(d.status==='incomplete')throw new Error('OpenAI output was incomplete. Try another model; no draft saved.');
  text=(d.output||[]).flatMap((o:{content?:{type:string;text?:string}[]})=>o.content||[]).filter((p:{type:string})=>p.type==='output_text').map((p:{text:string})=>p.text).join('');
 }else if(provider==='anthropic'){
  const d=await request('https://api.anthropic.com/v1/messages',provider,key,{model,max_tokens:6000,messages:[{role:'user',content:prompt}]});
  if(d.stop_reason==='max_tokens')throw new Error('Claude output was incomplete. Try another model; no draft saved.');
  text=(d.content||[]).filter((p:{type:string})=>p.type==='text').map((p:{text:string})=>p.text).join('');
 }else{
  const d=await request(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,provider,key,{contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}});
  if(d.candidates?.[0]?.finishReason!=='STOP')throw new Error('Gemini did not complete the draft. No draft saved.');
  text=(d.candidates?.[0]?.content?.parts||[]).filter((p:{thought?:boolean})=>!p.thought).map((p:{text?:string})=>p.text||'').join('');
 }
 try{return JSON.parse(text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{throw new Error('Model did not return valid JSON. No draft saved; choose another text-generation model.');}
}
