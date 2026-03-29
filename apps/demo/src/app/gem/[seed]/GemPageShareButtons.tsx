"use client";

import { useEffect, useState } from "react";

const BUTTON_CLASS =
  "inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";

interface Props {
  seed: string;
  gemTypeName: string;
  rarityName: string;
}

export function GemPageShareButtons({ seed, gemTypeName, rarityName }: Props) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const gemUrl = `https://hashed-gems.vercel.app/gem/${encodeURIComponent(seed)}`;
  const tweetText = `Check out ${seed}'s gem — a ${rarityName} ${gemTypeName}! What's yours? 💎`;

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(gemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: `${rarityName} ${gemTypeName}`, url: gemUrl });
    } catch {
      // User cancelled
    }
  };

  return (
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
        <button type="button" onClick={handleNativeShare} className={BUTTON_CLASS}>
          Share
        </button>
      )}
    </div>
  );
}
