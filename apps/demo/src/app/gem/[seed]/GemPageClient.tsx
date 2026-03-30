"use client";

import { HashedGem } from "@m3000/hashed-gems";
import type { Rarity } from "@m3000/hashed-gems";
import { useEffect, useRef, useState } from "react";
import { RARITY_BADGE } from "@/lib/gemStyles";

const GEM_URL_BASE = "https://hashed-gems.vercel.app/gem";

const BUTTON_CLASS =
  "inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";

interface Props {
  seed: string;
  gemTypeName: string;
  cutTypeName: string;
  rarityName: Rarity;
  hasBlobImage: boolean;
}

export function GemPageClient({
  seed,
  gemTypeName,
  cutTypeName,
  rarityName,
  hasBlobImage,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const gemUrl = `${GEM_URL_BASE}/${encodeURIComponent(seed)}`;
  const tweetText = `Check out ${seed}'s gem — a ${rarityName} ${gemTypeName}! What's yours? 💎`;

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Auto-upload blob on mount so OG is ready when anyone shares the URL.
  // Skip if the server already confirmed the blob exists.
  useEffect(() => {
    if (hasBlobImage) return;

    const upload = async () => {
      const srcCanvas = containerRef.current?.querySelector(
        "canvas.hashed-gem",
      ) as HTMLCanvasElement | null;
      if (!srcCanvas) return;

      const { width: w, height: h } = srcCanvas;
      const out = document.createElement("canvas");
      out.width = w;
      out.height = h;
      const ctx = out.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(srcCanvas, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        out.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      const form = new FormData();
      form.append("file", blob, `${seed}.png`);
      form.append("seed", seed);
      await fetch("/api/gem-image", { method: "POST", body: form });
    };

    // Wait a frame so the WebGL gem has rendered at least once
    const id = requestAnimationFrame(() => {
      upload().catch(() => { });
    });
    return () => cancelAnimationFrame(id);
  }, [seed, hasBlobImage]);

  const captureBlob = async (): Promise<Blob | null> => {
    const srcCanvas = containerRef.current?.querySelector(
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

  const uploadBlob = async (blob: Blob) => {
    const form = new FormData();
    form.append("file", blob, `${seed}.png`);
    form.append("seed", seed);
    await fetch("/api/gem-image", { method: "POST", body: form });
  };

  const handleCopyLink = async () => {
    captureBlob()
      .then((blob) => blob && uploadBlob(blob))
      .catch(() => { });

    await navigator.clipboard.writeText(gemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
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
      <div ref={containerRef} className="mb-6">
        <HashedGem seed={seed} size={128} resolution={512} />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-1.5">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${RARITY_BADGE[rarityName]}`}
        >
          {rarityName}
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {gemTypeName}
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500">
          {cutTypeName} cut
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gemUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={BUTTON_CLASS}
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
