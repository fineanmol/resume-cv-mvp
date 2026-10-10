import json,re,subprocess,logging
from pathlib import Path
import pdfplumber
from PIL import Image,ImageDraw
root=Path('work/template-validation')
logging.getLogger('pdfminer').setLevel(logging.ERROR)
report=json.loads((root/'report.json').read_text())
issues=[]
for item in report['reports']:
 with pdfplumber.open(item['path']) as pdf:
  texts=[p.extract_text(use_text_flow=True) or '' for p in pdf.pages]
  # Positioned headers may be emitted after body text in the PDF stream. Remove
  # known synthetic header text before joining a sentence continued on page 2.
  def normalize(s):
   for header in ['Test Candidate','FRONTEND SOFTWARE ENGINEER | VUE.JS, REACT & TYPESCRIPT','Frontend Software Engineer | Vue.js, React & TypeScript','candidate@example.com Berlin, Germany']:
    s=s.replace(header,'')
   return re.sub(r'\s+',' ',re.sub(r'-\s+','-',s)).strip()
  alltext=normalize(' '.join(texts))
  missing=[s for s in item['expectedText'] if normalize(s) not in alltext]
  blank=[i+1 for i,t in enumerate(texts) if not t.strip()]
  outside=sum(1 for p in pdf.pages for c in p.chars if c['x0'] < -1 or c['x1']>p.width+1 or c['top'] < -1 or c['bottom']>p.height+1)
  links=[a.get('uri','') for page in pdf.pages for a in page.annots or []]
  item['evidenceLinkPresent']=item['kind']!='resume' or 'https://example.com/evidence' in links
  item['missingText']=missing;item['blankPages']=blank;item['outsideCharacters']=outside
  if missing or blank or outside or not item['evidenceLinkPresent']:issues.append({k:item[k] for k in ['kind','template','fixture','pages','missingText','blankPages','outsideCharacters','evidenceLinkPresent']})
  if item['fixture']=='two-page':
   subprocess.run(['pdftoppm','-scale-to','450','-png',item['path'],str(root/('final-'+item['kind']+'-'+item['template']))],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
(root/'text-report.json').write_text(json.dumps({'issues':issues,'reports':report['reports']},indent=2))
for kind in ['resume','coverletter']:
 images=sorted(root.glob('final-'+kind+'-*-*.png'))
 width=1280;height=((len(images)+3)//4)*480
 sheet=Image.new('RGB',(width,height),'#dce3e8');d=ImageDraw.Draw(sheet)
 for i,p in enumerate(images):
  image=Image.open(p);image.thumbnail((310,450));x=(i%4)*320;y=(i//4)*480
  sheet.paste(image,(x,y+25));d.text((x+5,y+5),p.stem,fill='black')
 sheet.save(root/(kind+'-contact-sheet.png'))
print(json.dumps(issues,indent=2))
