export const GEM_IMAGE_RESOLUTION = 512;
export const MAX_GEM_SEED_LENGTH = 256;

export function decodeGemSeed(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function isValidGemSeed(seed: string): boolean {
  const trimmed = seed.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_GEM_SEED_LENGTH;
}

export function getGemRenderPath(seed: string): string {
  return `/render/gem/${encodeURIComponent(seed)}`;
}
