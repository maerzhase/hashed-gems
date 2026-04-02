"use client";

import {
  getCutVariant,
  getCutVariantLabel,
  getGemProperties,
  HashedGem,
} from "@m3000/hashed-gems";
import { useEffect, useState } from "react";
import { RARITY_BADGE } from "@/lib/gemStyles";
import { getGemShareUrl } from "@/lib/gemShareUrl";

export const BUTTON_CLASS =
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

export function XShareButton({
  seed,
  gemTypeName,
  rarityName,
  onClick,
}: {
  seed: string;
  gemTypeName: string;
  rarityName: string;
  onClick?: () => void;
}) {
  const gemUrl = getGemShareUrl(seed);
  const tweetText = `Check out ${seed}'s gem — a ${rarityName} ${gemTypeName}! What's yours? 💎`;

  return (
    <a
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gemUrl)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={BUTTON_CLASS}
      onClick={() => {
        warmGemShareImage(seed);
        onClick?.();
      }}
    >
      Post on X
    </a>
  );
}

export function CopyLinkButton({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const gemUrl = getGemShareUrl(seed);

  const handleCopyLink = async () => {
    warmGemShareImage(seed);
    await navigator.clipboard.writeText(gemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopyLink}
      className={className || BUTTON_CLASS}
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

export function NativeShareButton({
  seed,
  gemTypeName,
  rarityName,
  className,
}: {
  seed: string;
  gemTypeName: string;
  rarityName: string;
  className?: string;
}) {
  const gemUrl = getGemShareUrl(seed);

  const handleNativeShare = async () => {
    try {
      warmGemShareImage(seed);
      await navigator.share({
        title: `${rarityName} ${gemTypeName}`,
        url: gemUrl,
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <button
      type="button"
      onClick={handleNativeShare}
      className={className || BUTTON_CLASS}
    >
      Share
    </button>
  );
}

interface GemGeneratorProps {
  seed: string;
}

export function GemGenerator({ seed }: GemGeneratorProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);

  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);
  const cutLabel = formatCutLabel(cutTypeName);
  const cutVariantLabel = getCutVariantLabel(getCutVariant(seed, cutTypeName));

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6">
      <div>
        <HashedGem seed={seed} size={128} resolution={512} />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
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
          {cutVariantLabel}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <XShareButton
          seed={seed}
          gemTypeName={gemTypeName}
          rarityName={rarityName}
        />

        <CopyLinkButton seed={seed} />

        {canNativeShare && (
          <NativeShareButton
            seed={seed}
            gemTypeName={gemTypeName}
            rarityName={rarityName}
          />
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
