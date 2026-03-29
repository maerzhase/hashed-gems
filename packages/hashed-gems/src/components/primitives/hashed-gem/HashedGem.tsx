"use client";

import type * as React from "react";
import { cn } from "@/lib/cn";
import type { CutType, GemType } from "@/lib/gem";
import { CUT_TYPES, GEM_TYPES, getGemProperties } from "@/lib/gem";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { useWebGL } from "./useWebGL";

export interface HashedGemProps {
  /** Display size in pixels (canvas width & height). Default: 64 */
  size?: number;
  /** Any string — username, address, id — hashed to a deterministic avatar */
  seed: string;
  /** Render a single frame and stop animating. Good for lists. Default: false */
  static?: boolean;
  /** Override the gem type derived from seed */
  gemType?: GemType;
  /** Override the cut type derived from seed */
  cutType?: CutType;
  className?: string;
}

export function HashedGem({
  size = 64,
  seed,
  static: isStatic = false,
  gemType,
  cutType,
  className,
}: HashedGemProps): React.ReactElement {
  const props = getGemProperties(seed);

  const uSeed = props.seed;
  const uGemType =
    gemType !== undefined ? GEM_TYPES.indexOf(gemType) : props.gemType;
  const uCutType =
    cutType !== undefined ? CUT_TYPES.indexOf(cutType) : props.cutType;
  const uCausticCount = props.causticCount;
  const uRarity = props.rarity;

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
