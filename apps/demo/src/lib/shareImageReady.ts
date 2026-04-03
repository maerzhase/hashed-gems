"use client";

import { getGemApiImagePath } from "@/lib/gemAssetUrl";

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

export async function checkShareImageReady(seed: string): Promise<boolean> {
  if (isShareImageReady(seed)) {
    return true;
  }

  const response = await fetch(getGemApiImagePath(seed), {
    method: "HEAD",
  });

  const ready = response.status === 204;

  if (ready) {
    markShareImageReady(seed);
  }

  return ready;
}

export async function ensureShareImageReady(seed: string): Promise<void> {
  if (isShareImageReady(seed)) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve();
    image.onerror = () => {
      reject(new Error(`Failed to prepare share image for seed "${seed}"`));
    };
    image.src = getGemApiImagePath(seed);
  });

  markShareImageReady(seed);
}
