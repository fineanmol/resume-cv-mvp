import assert from 'node:assert/strict';
const base='http://127.0.0.1:8793/api/v2';
const jd='Frontend engineer with Vue 3, TypeScript, React, Storybook, Vitest, REST APIs and CI/CD. Build reusable components and optimize performance.';
const master=await (await fetch(base+'/profiles/anmol')).json();
for(const template of ['hybrid','designer','ats']){
 const response=await fetch(base+'/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profileId:'anmol',company:'Smoke test 5',role:'Frontend engineer',jobDescription:jd,template})});
 const result=await response.json();assert.equal(response.status,200,JSON.stringify(result));
 const pdf=await fetch('http://127.0.0.1:8793'+result.pdfUrl);assert.equal(pdf.status,200);const bytes=Buffer.from(await pdf.arrayBuffer());assert.equal(bytes.subarray(0,4).toString(),'%PDF');
 const variant=await (await fetch('http://127.0.0.1:8793'+result.jsonUrl)).json();assert.equal(variant.name,master.name);assert.equal(variant.template,template);assert(!variant.skills.flatMap(s=>s.items).includes('KYC'));
 console.log(JSON.stringify({template,id:result.id,bytes:bytes.length,pdf:result.pdfUrl}));
}
const unchanged=await(await fetch(base+'/profiles/anmol')).json();assert.deepEqual(unchanged,master);
const bad=await fetch(base+'/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profileId:'../sakshi',jobDescription:jd})});assert.equal(bad.status,400);
console.log('API smoke checks passed: PDF generation, template selection, master isolation, invalid-path rejection.');
