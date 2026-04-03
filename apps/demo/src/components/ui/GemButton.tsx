"use client";

import { HashedGem } from "@m3000/hashed-gems";
import type { ComponentPropsWithoutRef } from "react";

interface GemButtonProps extends ComponentPropsWithoutRef<"button"> {
  seed: string;
  size?: number;
  resolution?: number;
}

export function GemButton({
  seed,
  size = 64,
  resolution,
  ...props
}: GemButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className="relative cursor-pointer transition-transform hover:scale-105 focus-visible:outline-none focus-visible:[&_.hashed-gem-container]:ring-2 focus-visible:[&_.hashed-gem-container]:ring-black/60 focus-visible:[&_.hashed-gem-container]:ring-offset-2 focus-visible:[&_.hashed-gem-container]:ring-offset-neutral-50 dark:focus-visible:[&_.hashed-gem-container]:ring-white/60 dark:focus-visible:[&_.hashed-gem-container]:ring-offset-neutral-950"
    >
      <HashedGem seed={seed} size={size} resolution={resolution} />
    </button>
  );
}
