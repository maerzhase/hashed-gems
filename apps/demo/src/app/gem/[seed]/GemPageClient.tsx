"use client";

import type { Rarity } from "@m3000/hashed-gems";
import { HashedGem } from "@m3000/hashed-gems";
import { GemShareActions } from "@/components/GemShareActions";
import { Badge, RarityBadge } from "@/components/ui/Badge";
import { formatCutLabel } from "@/lib/gemLabel";

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
        <HashedGem
          seed={seed}
          size={128}
          resolution={512}
          aria-label={`Gem avatar for ${seed}`}
        />
      </div>

      <div className="mb-5 flex flex-wrap justify-center gap-1.5">
        <RarityBadge rarity={rarityName} />
        <Badge variant="subtle">{gemTypeName}</Badge>
        <Badge>{cutLabel} Cut</Badge>
        <Badge>{cutVariantName}</Badge>
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
