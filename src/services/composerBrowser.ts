export const composerEnabled = () => false;
export const preferComposerFirst = () => false;
export async function composerRequestJson<T>():Promise<T> { throw new Error('Composer is available through the local server only.'); }
export function extractGeminiPrompt(payload:unknown):{prompt:string;schema?:unknown} { void payload; return {prompt:''}; }
