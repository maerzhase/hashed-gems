const DEFAULT_GEM_SITE_URL = "https://gems.m3000.io";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getGemSiteUrl(): string {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_GEM_SITE_URL,
  );
}

export function getGemApiImagePath(seed: string): string {
  return `/api/gems/${encodeURIComponent(seed)}`;
}

export function getGemApiImageUrl(
  seed: string,
  origin = getGemSiteUrl(),
): string {
  return `${trimTrailingSlash(origin)}${getGemApiImagePath(seed)}`;
}
