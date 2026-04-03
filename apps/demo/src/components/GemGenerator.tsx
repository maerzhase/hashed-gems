"use client";

import {
  getCutVariant,
  getCutVariantLabel,
  getGemProperties,
  HashedGem,
} from "@m3000/hashed-gems";
import { GemShareActions } from "@/components/GemShareActions";
import { Badge, RarityBadge } from "@/components/ui/Badge";

function formatCutLabel(cutTypeName: string): string {
  return cutTypeName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface GemGeneratorProps {
  seed: string;
}

export function GemGenerator({ seed }: GemGeneratorProps) {
  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);
  const cutLabel = formatCutLabel(cutTypeName);
  const cutVariantLabel = getCutVariantLabel(getCutVariant(seed, cutTypeName));

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6">
      <div>
        <HashedGem seed={seed} size={128} resolution={512} />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        <RarityBadge rarity={rarityName} />
        <Badge variant="subtle">{gemTypeName}</Badge>
        <Badge>
          {cutLabel} Cut
        </Badge>
        <Badge>{cutVariantLabel}</Badge>
      </div>

      <GemShareActions
        seed={seed}
        gemTypeName={gemTypeName}
        rarityName={rarityName}
      />

      <a
        href={`/gem/${encodeURIComponent(seed)}`}
        className="text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        View gem page →
      </a>
    </div>
  );
}
