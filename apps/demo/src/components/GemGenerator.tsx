"use client";

import { HashedGem, getGemProperties } from "@m3000/hashed-gems";
import { useEffect, useRef, useState } from "react";
import { RARITY_BADGE } from "@/lib/gemStyles";

const GEM_URL_BASE = "https://hashed-gems.vercel.app/gem";

const BUTTON_CLASS =
  "inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";

interface GemGeneratorProps {
  seed: string;
}

export function GemGenerator({ seed }: GemGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);
  const gemUrl = `${GEM_URL_BASE}/${encodeURIComponent(seed)}`;

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const captureCanvas = async (): Promise<Blob | null> => {
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

    // Transparent background so it composites cleanly on any bg in the OG image
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(srcCanvas, 0, 0);

    return new Promise<Blob | null>((resolve) =>
      out.toBlob(resolve, "image/png"),
    );
  };

  const uploadGem = async (blob: Blob): Promise<void> => {
    const form = new FormData();
    form.append("file", blob, `${seed}.png`);
    form.append("seed", seed);
    await fetch("/api/gem-image", { method: "POST", body: form });
  };

  const handleShareOnX = async () => {
    setSharing(true);
    try {
      const blob = await captureCanvas();
      if (blob) await uploadGem(blob);
    } catch {
      // Upload failed — proceed anyway, OG will use gradient fallback
    } finally {
      setSharing(false);
    }

    const text = `My gem is a ${rarityName} ${gemTypeName}! What's yours? 💎`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(gemUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCopyLink = async () => {
    // Fire-and-forget upload so the OG is ready when someone opens the link
    captureCanvas()
      .then((blob) => blob && uploadGem(blob))
      .catch(() => { });

    await navigator.clipboard.writeText(gemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const blob = await captureCanvas();
    if (!blob) return;
    const file = new File([blob], `${seed}-gem.png`, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My ${rarityName} ${gemTypeName}`,
          text: `My gem is a ${rarityName} ${gemTypeName}! What's yours? 💎`,
          url: gemUrl,
        });
      } else {
        await navigator.share({
          title: `My ${rarityName} ${gemTypeName}`,
          url: gemUrl,
        });
      }
    } catch {
      // User cancelled or share failed
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6">
      <div ref={containerRef}>
        <HashedGem seed={seed} size={128} resolution={512} />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
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
        <button
          type="button"
          onClick={handleShareOnX}
          disabled={sharing}
          className={`${BUTTON_CLASS} disabled:cursor-wait disabled:opacity-60`}
        >
          {sharing ? "Preparing…" : "Post on X"}
        </button>

        <button type="button" onClick={handleCopyLink} className={BUTTON_CLASS}>
          {copied ? "Copied!" : "Copy link"}
        </button>

        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className={BUTTON_CLASS}
          >
            Share
          </button>
        )}
      </div>

      <a
        href={`/gem/${encodeURIComponent(seed)}`}
        className="text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        View gem page →
      </a>
    </div>
  );
}
