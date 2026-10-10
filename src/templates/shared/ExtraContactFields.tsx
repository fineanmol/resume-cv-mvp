import {Star} from 'lucide-react';
import {CONTACT_ICON_MAP} from '../../components/ui/ContactIconPicker';
import type {CustomContactField} from '../../types';
export function contactHref(value:string){
 const raw=value.trim();
 if(/^(https?:\/\/|mailto:|tel:)/i.test(raw))return raw;
 if(/^[\w-]+(?:\.[\w-]+)+(?:[/?#].*)?$/.test(raw))return `https://${raw}`;
 return undefined;
}
/** Contact data is shared; templates only decide where to place this component. */
export function ExtraContactFields({fields=[]}:{fields?:CustomContactField[]}){
 return <>{fields.filter(f=>f.value.trim()).map(field=>{
  const Icon=CONTACT_ICON_MAP[field.icon]??Star,href=contactHref(field.value);
  return <span data-extra-contact={field.id} key={field.id} className="inline-flex items-center gap-1.5 max-w-full" style={{overflowWrap:'anywhere'}}><Icon size={12} className="shrink-0" aria-hidden="true"/>{href?<a href={href} target="_blank" rel="noreferrer" title={field.label||undefined}>{field.value}</a>:<span>{field.label?`${field.label}: `:''}{field.value}</span>}</span>;
 })}</>;
}
