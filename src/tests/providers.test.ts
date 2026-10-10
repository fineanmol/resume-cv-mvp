import {afterEach,describe,it,expect,vi} from 'vitest';
import {generateProse,listModels,modelSchema} from '../../server/providers';
afterEach(()=>vi.unstubAllGlobals());
describe('provider adapters',()=>{
 it('uses Responses without persisting OpenAI prompts',async()=>{const f=vi.fn().mockResolvedValue({ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:'{"summary":"Hi"}'}]}]})});vi.stubGlobal('fetch',f);expect(await generateProse('openai','test-model','JSON please','test-key')).toEqual({summary:'Hi'});expect(JSON.parse(f.mock.calls[0][1].body)).toMatchObject({store:false,model:'test-model'});});
 it('extracts Claude text, rejecting truncation',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({stop_reason:'max_tokens',content:[]})}));await expect(generateProse('anthropic','test-model','JSON','test-key')).rejects.toThrow('incomplete');});
 it('filters Gemini models by generateContent capability',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({models:[{name:'models/text',supportedGenerationMethods:['generateContent']},{name:'models/embed',supportedGenerationMethods:['embedContent']}]})}));expect(await listModels('gemini','test-key')).toEqual([{id:'text',name:'text'}]);});
 it('does not expose error response bodies or keys',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:401,text:async()=> 'secret-key'}));await expect(listModels('openai','secret-key')).rejects.toThrow('HTTP 401');});
 it('prevents model IDs from changing endpoint paths',()=>expect(modelSchema.safeParse('../models/x?key=y').success).toBe(false));
});
