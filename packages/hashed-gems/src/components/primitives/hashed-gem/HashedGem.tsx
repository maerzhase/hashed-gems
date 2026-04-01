"use client";

import type * as React from "react";
import { useCallback, useState } from "react";
import type { CutType, GemType } from "@/lib/gem";
import { CUT_TYPES, GEM_TYPES, getGemProperties, getShaderSeed } from "@/lib/gem";
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
  const containerClassName = ["hashed-gem-container", className]
    .filter(Boolean)
    .join(" ");

  const uSeed = getShaderSeed(seed);
  const uGemType =
    gemType !== undefined ? GEM_TYPES.indexOf(gemType) : props.gemType;
  const uCutType =
    cutType !== undefined ? CUT_TYPES.indexOf(cutType) : props.cutType;
  const uCausticCount = props.causticCount;
  const uRarity = props.rarity;
  const uniforms = {
    uSeed,
    uCausticCount,
    uGemType,
    uCutType,
    uRarity,
    size,
    resolution,
  };

  const [webglReady, setWebglReady] = useState(false);
  const onReady = useCallback(() => setWebglReady(true), []);

  const glowCanvasRef = useWebGL({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      ...uniforms,
      uPassType: 1,
    },
    isStatic,
  });

  const coreCanvasRef = useWebGL({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      ...uniforms,
      uPassType: 0,
    },
    isStatic,
    onReady,
  });

  return (
    <div
      className={containerClassName}
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "visible",
      }}
    >
      <canvas
        ref={glowCanvasRef}
        className="hashed-gem-layer hashed-gem-glow"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />
      <div
        className="hashed-gem-core"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: "inherit",
        }}
      >
        {!webglReady && (
          <HashedGemGradient
            size={size}
            seed={seed}
            gemType={gemType}
            cutType={cutType}
            position="absolute"
          />
        )}
        <canvas
          ref={coreCanvasRef}
          className="hashed-gem hashed-gem-core-canvas hashed-gem-layer"
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
    </div>
  );
}
