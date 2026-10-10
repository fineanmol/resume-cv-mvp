import {readFileSync,writeFileSync} from 'node:fs';
for(const file of ['src/components/DesignPanel.tsx','src/components/design/DesignColorsSection.tsx','src/components/design/DesignTypographySection.tsx','src/components/design/DesignSpacingSection.tsx']){
 let s=readFileSync(file,'utf8').replace("(layout.template ?? 'navy') === 'designer'","['designer','hybrid'].includes(layout.template ?? 'navy')");
 s=s.replace('Restore Figma design defaults','Restore template design defaults');
 writeFileSync(file,s);
}
for(const file of ['src/components/layout/EditorLayout.tsx','src/components/design/DesignTemplateSection.tsx','src/App.tsx']){
 let s=readFileSync(file,'utf8');
 const relative=file.includes('/layout/')?'../../config/':file.includes('/design/')?'../../config/':'./config/';
 s=`import { HYBRID_STYLE_DEFAULTS } from '${relative}hybridDefaults';\n`+s;
 if(file.endsWith('EditorLayout.tsx'))s=s.replace('...p.layoutSettings, ...DESIGNER_STYLE_DEFAULTS','...p.layoutSettings, ...(p.layoutSettings.template === \'hybrid\' ? HYBRID_STYLE_DEFAULTS : DESIGNER_STYLE_DEFAULTS)');
 if(file.endsWith('DesignTemplateSection.tsx'))s=s.replace('onChange({ template: t.id })',"onChange(t.id === 'hybrid' ? {...HYBRID_STYLE_DEFAULTS} : { template: t.id })");
 if(file.endsWith('App.tsx'))s=s.replace('...source.layoutSettings, template','...source.layoutSettings, ...(template === \'hybrid\' ? HYBRID_STYLE_DEFAULTS : {}), template');
 writeFileSync(file,s);
}
