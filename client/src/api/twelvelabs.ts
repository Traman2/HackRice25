const API_BASE: string = (import.meta as any).env?.VITE_TWELVE_PROXY || 'http://localhost:4000';

export async function analyzeUrl(url: string): Promise<any> {
  const res = await fetch(`${API_BASE}/analyze/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadFile(file: File): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/analyze/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function summarize(transcription: string, timestamps?: any[], wantTimestamps = true): Promise<any> {
  const res = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcription, timestamps, wantTimestamps }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default { analyzeUrl, uploadFile, summarize };
