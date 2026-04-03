"use client";

import type { Rarity } from "@m3000/hashed-gems";
import { HashedGem } from "@m3000/hashed-gems";
import { RARITY_BADGE } from "@/lib/gemStyles";
import { GemShareActions } from "@/components/GemShareActions";

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
  const cutLabel = formatCutLabel(cutTypeName);

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

      <GemShareActions
        seed={seed}
        gemTypeName={gemTypeName}
        rarityName={rarityName}
        getShareFile={async () => {
          const blob = await captureBlob();
          if (!blob) {
            return null;
          }

          return {
            file: new File([blob], `${seed}-gem.png`, { type: "image/png" }),
          };
        }}
      />
    </div>
  );
}
