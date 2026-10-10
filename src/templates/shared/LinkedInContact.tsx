import { LI } from './LinkedInIcon';
import { formatLinkedinUrl } from '../../utils/linkedin';

/** Keep the destination intact without spending a header line on its URL. */
export function LinkedInContact({value}:{value:string}) {
  return <a data-linkedin-contact href={formatLinkedinUrl(value)} title={value} aria-label="LinkedIn profile" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1"><LI/><span>LinkedIn</span></a>;
}
