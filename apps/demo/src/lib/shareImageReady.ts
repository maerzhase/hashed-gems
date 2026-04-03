"use client";

const SHARE_IMAGE_READY_KEY_PREFIX = "hashed-gems:share-ready:";

function getShareImageReadyKey(seed: string): string {
  return `${SHARE_IMAGE_READY_KEY_PREFIX}${seed}`;
}

export function isShareImageReady(seed: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(getShareImageReadyKey(seed)) === "1";
}

export function markShareImageReady(seed: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(getShareImageReadyKey(seed), "1");
}

export async function ensureShareImageReady(seed: string): Promise<void> {
  if (isShareImageReady(seed)) {
    return;
  }

  const response = await fetch(`/api/gems/${encodeURIComponent(seed)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to prepare share image for seed "${seed}"`);
  }

  markShareImageReady(seed);
}
