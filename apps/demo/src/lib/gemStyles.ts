import type { Rarity } from "@m3000/hashed-gems";

export const RARITY_BADGE: Record<Rarity, string> = {
  common:
    "border-transparent bg-neutral-100 text-neutral-600 dark:border-neutral-700/50 dark:bg-neutral-800 dark:text-neutral-300",
  uncommon:
    "border-transparent bg-green-100 text-green-700 dark:border-emerald-500/25 dark:bg-emerald-950/70 dark:text-emerald-300",
  rare:
    "border-transparent bg-blue-100 text-blue-700 dark:border-blue-500/25 dark:bg-blue-950/70 dark:text-blue-300",
  epic:
    "border-transparent bg-purple-100 text-purple-700 dark:border-violet-500/30 dark:bg-violet-950/70 dark:text-violet-300",
  legendary:
    "border-transparent bg-amber-100 text-amber-700 dark:border-amber-400/30 dark:bg-amber-950/60 dark:text-amber-300",
};
