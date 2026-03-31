const GEM_URL_BASE = "https://gems.m3000.io/gem";

export function getGemShareUrl(seed: string): string {
  return `${GEM_URL_BASE}/${encodeURIComponent(seed)}`;
}
