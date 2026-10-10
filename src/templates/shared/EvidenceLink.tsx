import { ExternalLink } from 'lucide-react';
export function EvidenceLink({url}:{url?:string}){return url&&/^https?:\/\//i.test(url)?<a href={url} target="_blank" rel="noreferrer" title="Supporting document" className="inline-flex items-center gap-1 text-[9px] text-sky-700 underline"><ExternalLink size={10}/>Link</a>:null;}
