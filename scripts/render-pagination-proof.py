from pathlib import Path
import subprocess
from PIL import Image,ImageOps,ImageDraw
root=Path('work/template-validation')
names=['resume-'+t+'-two-page' for t in ['hybrid','designer','navy','serif','sidebar','tech','ats','executive']]
names+=['resume-hybrid-oversized','coverletter-professional-two-page']
thumbs=[]
for name in names:
    subprocess.run(['pdftoppm','-scale-to','640','-png',str(root/(name+'.pdf')),str(root/name)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    pages=sorted(root.glob(name+'-*.png'))
    for page in pages:
        image=Image.open(page).convert('RGB')
        thumb=ImageOps.pad(image,(450,640),color='white')
        label=Image.new('RGB',(470,680),'#dfe5eb');label.paste(thumb,(10,28));ImageDraw.Draw(label).text((10,8),page.stem,fill='black');thumbs.append(label)
for start in range(0,len(thumbs),8):
    board=Image.new('RGB',(470*4,680*2),'#dfe5eb')
    for j,img in enumerate(thumbs[start:start+8]):board.paste(img,((j%4)*470,(j//4)*680))
    board.save(root/f'visual-review-{start//8+1}.jpg')
print(len(thumbs),'pages rendered')
