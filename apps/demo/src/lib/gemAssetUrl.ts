const DEFAULT_GEM_ASSET_BASE_URL =
  "https://c36zhng9zp5ehtzj.public.blob.vercel-storage.com";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getGemAssetBaseUrl(): string {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_GEM_ASSET_BASE_URL ?? DEFAULT_GEM_ASSET_BASE_URL,
  );
}

export function getGemAssetUrl(seed: string): string {
  return `${getGemAssetBaseUrl()}/gems/${encodeURIComponent(seed)}.png`;
}
