"use client";

import type { Rarity } from "@m3000/hashed-gems";
import { HashedGem } from "@m3000/hashed-gems";
import { useEffect, useState } from "react";
import { RARITY_BADGE } from "@/lib/gemStyles";
import { getGemShareUrl } from "@/lib/gemShareUrl";

const BUTTON_CLASS =
  "inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";

function warmGemShareImage(seed: string) {
  void fetch(`/api/gems/${encodeURIComponent(seed)}`, {
    cache: "force-cache",
    keepalive: true,
  }).catch(() => {});
}

function formatCutLabel(cutTypeName: string): string {
  return cutTypeName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface Props {
  seed: string;
  gemTypeName: string;
  cutTypeName: string;
  cutVariantName: string;
  rarityName: Rarity;
}

export function GemPageClient({
  seed,
  gemTypeName,
  cutTypeName,
  cutVariantName,
  rarityName,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const cutLabel = formatCutLabel(cutTypeName);

  const gemUrl = getGemShareUrl(seed);
  const tweetText = `Check out ${seed}'s gem — a ${rarityName} ${gemTypeName}! What's yours? 💎`;
  const warmKey = `hashed-gems:warmed:${seed}`;

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(warmKey) === "1") return;

    const id = requestAnimationFrame(() => {
      warmGemShareImage(seed);
      sessionStorage.setItem(warmKey, "1");
    });

    return () => cancelAnimationFrame(id);
  }, [seed, warmKey]);

  const captureBlob = async (): Promise<Blob | null> => {
    const srcCanvas = document.querySelector(
      "canvas.hashed-gem",
    ) as HTMLCanvasElement | null;
    if (!srcCanvas) return null;

    const { width: w, height: h } = srcCanvas;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(srcCanvas, 0, 0);

    return new Promise<Blob | null>((resolve) =>
      out.toBlob(resolve, "image/png"),
    );
  };

  const handleCopyLink = async () => {
    warmGemShareImage(seed);
    await navigator.clipboard.writeText(gemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    warmGemShareImage(seed);
    const blob = await captureBlob();
    if (!blob) return;
    const file = new File([blob], `${seed}-gem.png`, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${rarityName} ${gemTypeName}`,
          text: tweetText,
          url: gemUrl,
        });
      } else {
        await navigator.share({
          title: `${rarityName} ${gemTypeName}`,
          url: gemUrl,
        });
      }
    } catch {
      // User cancelled or share failed
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">
        <HashedGem seed={seed} size={128} resolution={512} />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-1.5">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${RARITY_BADGE[rarityName]}`}
        >
          {rarityName}
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 capitalize dark:bg-neutral-800 dark:text-neutral-400">
          {gemTypeName}
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500">
          {cutLabel} Cut
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500 capitalize dark:bg-neutral-800 dark:text-neutral-500">
          {cutVariantName}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gemUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={BUTTON_CLASS}
          onClick={() => warmGemShareImage(seed)}
        >
          Post on X
        </a>

        <button type="button" onClick={handleCopyLink} className={BUTTON_CLASS}>
          {copied ? "Copied!" : "Copy link"}
        </button>

        {canShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className={BUTTON_CLASS}
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}
