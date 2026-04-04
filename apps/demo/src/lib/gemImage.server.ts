import "server-only";

import { createHash } from "node:crypto";
import { getGemRenderPath } from "@/lib/gemImage";

export const GEM_IMAGE_OBJECT_CACHE_MAX_AGE = 60 * 60 * 24 * 365;
const CHROMIUM_PACK_VERSION = "143.0.4";

function sanitizeVersionSegment(value: string): string {
  const trimmed = value.trim();
  const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return sanitized.length > 0 ? sanitized : "dev";
}

export function getGemImageRendererVersion(): string {
  return sanitizeVersionSegment(
    process.env.GEM_RENDERER_VERSION ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      "dev",
  );
}

export function getGemImageBlobPath(seed: string, version: string): string {
  const seedHash = createHash("sha256").update(seed).digest("hex");
  return `gems/${sanitizeVersionSegment(version)}/${seedHash}.png`;
}

export function getGemImageObjectCacheControl(): string {
  return `public, max-age=${GEM_IMAGE_OBJECT_CACHE_MAX_AGE}, immutable`;
}

export function getGemImageRedirectHeaders(): Record<string, string> {
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    "Vercel-CDN-Cache-Control":
      "public, s-maxage=3600, stale-while-revalidate=604800",
  };
}

export function getGemRenderUrl(origin: string, seed: string): string {
  return new URL(getGemRenderPath(seed), origin).toString();
}

export function getDefaultChromiumPackUrl(): string {
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  const version = CHROMIUM_PACK_VERSION;
  return `https://github.com/Sparticuz/chromium/releases/download/v${version}/chromium-v${version}-pack.${arch}.tar`;
}

export function getLocalChromeExecutablePath(): string | null {
  const candidates = [
    process.env.CHROME_EXECUTABLE_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : null,
    process.platform === "darwin"
      ? "/Applications/Chromium.app/Contents/MacOS/Chromium"
      : null,
    process.platform === "linux" ? "/usr/bin/google-chrome-stable" : null,
    process.platform === "linux" ? "/usr/bin/google-chrome" : null,
    process.platform === "linux" ? "/usr/bin/chromium-browser" : null,
    process.platform === "linux" ? "/usr/bin/chromium" : null,
    process.platform === "win32"
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : null,
    process.platform === "win32"
      ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
      : null,
  ];

  for (const candidate of candidates) {
    if (candidate) {
      return candidate;
    }
  }

  return null;
}
