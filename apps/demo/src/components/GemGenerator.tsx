"use client";

import {
  getCutVariant,
  getCutVariantLabel,
  getGemProperties,
  HashedGem,
} from "@m3000/hashed-gems";
import { RARITY_BADGE } from "@/lib/gemStyles";
import { GemShareActions } from "@/components/GemShareActions";

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
