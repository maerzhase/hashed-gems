"use client";

import type * as React from "react";
import type { CutType, GemType } from "@/lib/gem";
import {
  CUT_TYPES,
  GEM_TYPES,
  getGemProperties,
  getShaderSeed,
} from "@/lib/gem";
import { resolveGemMotionProfile } from "./motion";
import { HashedGemGradient } from "./HashedGemGradient";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { useWebGL } from "./useWebGL";

export interface HashedGemProps {
  /** CSS display size in pixels. Controls the container width & height. Default: 64 */
  size?: number;
  /**
   * WebGL canvas pixel resolution. Defaults to size × devicePixelRatio (retina-sharp).
   * Pass a larger value to render at higher quality for captures/exports
   * (e.g. resolution={512} on a size={160} gem for a crisp blob image).
   */
  resolution?: number;
  /** Any string — username, address, id — hashed to a deterministic avatar */
  seed: string;
  /** Render a single frame and stop animating. Good for lists. Default: false */
  static?: boolean;
  /** Override the gem type derived from seed */
  gemType?: GemType;
  /** Override the cut type derived from seed */
  cutType?: CutType;
  /** CSS classes for styling (border-radius, shadows, etc.) */
  className?: string;
}

export function HashedGem({
  size = 64,
  resolution,
  seed,
  static: isStatic = false,
  gemType,
  cutType,
  className,
}: HashedGemProps): React.ReactElement {
  const props = getGemProperties(seed);
  const resolvedGemType = gemType ?? props.gemTypeName;
  const resolvedCutType = cutType ?? props.cutTypeName;
  const motionProfile = resolveGemMotionProfile({
    seed,
    gemType: resolvedGemType,
    cutType: resolvedCutType,
    rarity: props.rarityName,
  });

  const uSeed = getShaderSeed(seed);
  const uGemType = GEM_TYPES.indexOf(resolvedGemType);
  const uCutType = CUT_TYPES.indexOf(resolvedCutType);
  const uCausticCount = props.causticCount;
  const uRarity = props.rarity;

  const canvasRef = useWebGL({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uSeed,
      uCausticCount,
      uGemType,
      uCutType,
      uRarity,
      uMotionStyle: motionProfile.motionStyle,
      uMotionCadence: motionProfile.motionCadence,
      uLightCadence: motionProfile.lightCadence,
      uSparkleCadence: motionProfile.sparkleCadence,
      uGlowCadence: motionProfile.glowCadence,
      uFlareCadence: motionProfile.flareCadence,
      uColorCadence: motionProfile.colorCadence,
      uMotionIntensity: motionProfile.motionIntensity,
      uSparkleIntensity: motionProfile.sparkleIntensity,
      uGlowIntensity: motionProfile.glowIntensity,
      uFlareIntensity: motionProfile.flareIntensity,
      uMotionPhase: motionProfile.phaseOffset,
      size,
      resolution,
    },
    isStatic,
  });

  return (
    <div
      className={`hashed-gem-container ${className}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <HashedGemGradient
        size={size}
        seed={seed}
        gemType={gemType}
        cutType={cutType}
        position="absolute"
      />
      <canvas
        ref={canvasRef}
        className="hashed-gem"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        role="img"
        aria-label="Hashed gem avatar"
      />
    </div>
  );
}
