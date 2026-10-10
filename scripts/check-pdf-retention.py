"""Run after validate-templates.ts; fail on missing text or out-of-page glyphs."""
import json, logging, re, sys
from pathlib import Path
import pdfplumber
logging.disable(logging.CRITICAL)
report_path=Path('work/template-validation/report.json')
report=json.loads(report_path.read_text())
normalize=lambda s:re.sub(r'\s+', '', s)
failures=[]
for case in report['reports']:
    with pdfplumber.open(case['path']) as pdf:
        # Column resumes need content-stream order; letters need visual order
        # when a sentence crosses a page (header streams may be emitted last).
        text=normalize(''.join(page.extract_text(use_text_flow=True) or '' for page in pdf.pages))
        visual_text=normalize(''.join(page.extract_text() or '' for page in pdf.pages))
        missing=[s for s in case['expectedText'] if normalize(s) not in text and normalize(s) not in visual_text]
        outside=[i+1 for i,page in enumerate(pdf.pages) if any(c['x0'] < -1 or c['x1'] > page.width+1 or c['top'] < -1 or c['bottom'] > page.height+1 for c in page.chars)]
        case['textRetained']=not missing
        case['withinPage']=not outside
        if missing or outside:
            failures.append({'kind':case['kind'],'template':case['template'],'fixture':case['fixture'],'missing':missing,'outOfBoundsPages':outside})
report['checks']='A4 geometry, page count, whitespace-normalized expected text retention and glyph page bounds. Visual checks remain separate.'
report['failures']=failures
report_path.write_text(json.dumps(report,indent=2))
print(json.dumps({'cases':len(report['reports']),'failures':failures},indent=2))
sys.exit(bool(failures))
