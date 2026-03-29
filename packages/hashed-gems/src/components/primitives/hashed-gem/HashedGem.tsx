"use client";

import type * as React from "react";
import { cn } from "@/lib/cn";
import { hashString128, sfc32 } from "@/lib/rng";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { useWebGL } from "./useWebGL";

export type GemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface HashedGemProps {
  /** Display size in pixels (canvas width & height). Default: 64 */
  size?: number;
  /** Any string — username, address, id — hashed to a deterministic avatar. Default: "" */
  seed?: string;
  /** Render a single frame and stop animating. Good for lists. Default: false */
  static?: boolean;
  /** Override the gem type derived from seed. 0=diamond 1=ruby 2=sapphire 3=emerald 4=topaz 5=amethyst 6=aquamarine 7=rose-quartz 8=citrine 9=onyx 10=alexandrite 11=opal */
  gemType?: number;
  /** Override the cut type derived from seed. 0=round-brilliant 1=princess 2=cushion 3=emerald-step */
  cutType?: number;
  className?: string;
}

function deriveRarity(roll: number): { rarity: GemRarity; rarityInt: number } {
  if (roll >= 0.99) return { rarity: "legendary", rarityInt: 4 }; // 1%
  if (roll >= 0.95) return { rarity: "epic", rarityInt: 3 }; // 4%
  if (roll >= 0.85) return { rarity: "rare", rarityInt: 2 }; // 10%
  if (roll >= 0.6) return { rarity: "uncommon", rarityInt: 1 }; // 25%
  return { rarity: "common", rarityInt: 0 }; // 60%
}

export function HashedGem({
  size = 64,
  seed = "",
  static: isStatic = false,
  gemType,
  cutType,
  className,
}: HashedGemProps): React.ReactElement {
  // Create a deterministic PRNG from the seed string
  const rng = sfc32(hashString128(seed));

  // Draw values in a fixed order — each rng() call is independently random
  const uSeed = rng() * 1000.0; // [0, 1000) — fine visual variation
  const uGemType = gemType ?? Math.floor(rng() * 12); // 0–11 (overridable)
  const uCutType = cutType ?? Math.floor(rng() * 4); // 0–3  (overridable)
  const uCausticCount = 3 + Math.floor(rng() * 4); // 3–6
  const { rarityInt: uRarity } = deriveRarity(rng()); // rarity tier

  const canvasRef = useWebGL({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: { uSeed, uCausticCount, uGemType, uCutType, uRarity, size },
    isStatic,
  });

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Hashed gem avatar"
    />
  );
}
