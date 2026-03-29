import type { Rarity } from "@m3000/hashed-gems";

export const RARITY_BADGE: Record<Rarity, string> = {
  common:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  uncommon:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  rare: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  epic: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  legendary:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};
