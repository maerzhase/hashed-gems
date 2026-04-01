import type * as React from "react";
import type { CutType } from "@/lib/gem";
import { CUT_TYPES } from "@/lib/gem";
import {
  ROUND_BRILLIANT_GLSL,
  ROUND_BRILLIANT_BORDER_RADIUS,
  roundBrilliantCssGradient,
} from "./round-brilliant";
import {
  PRINCESS_GLSL,
  PRINCESS_BORDER_RADIUS,
  princessCssGradient,
} from "./princess";
import {
  CUSHION_GLSL,
  CUSHION_BORDER_RADIUS,
  cushionCssGradient,
} from "./cushion";
import {
  EMERALD_STEP_GLSL,
  EMERALD_STEP_BORDER_RADIUS,
  emeraldStepCssGradient,
} from "./emerald-step";
import {
  FIREWORK_GLSL,
  FIREWORK_BORDER_RADIUS,
  fireworkCssGradient,
} from "./firework";
import {
  JUBILEE_GLSL,
  JUBILEE_BORDER_RADIUS,
  jubileeCssGradient,
} from "./jubilee";
import { ROSE_GLSL, ROSE_BORDER_RADIUS, roseCssGradient } from "./rose";

export interface CutModule {
  /** GLSL function string implementing `CutResult compute<Name>(vec2 uv, float seed)` */
  glsl: string;
  /** CSS border-radius for the gradient fallback silhouette */
  borderRadius: string;
  /** CSS overlay gradient mimicking the cut's facet pattern */
  cssGradient: (seed: number, borderRadius: string) => React.CSSProperties;
}

export const CUT_MODULES: Record<CutType, CutModule> = {
  "round-brilliant": {
    glsl: ROUND_BRILLIANT_GLSL,
    borderRadius: ROUND_BRILLIANT_BORDER_RADIUS,
    cssGradient: roundBrilliantCssGradient,
  },
  princess: {
    glsl: PRINCESS_GLSL,
    borderRadius: PRINCESS_BORDER_RADIUS,
    cssGradient: princessCssGradient,
  },
  cushion: {
    glsl: CUSHION_GLSL,
    borderRadius: CUSHION_BORDER_RADIUS,
    cssGradient: cushionCssGradient,
  },
  "emerald-step": {
    glsl: EMERALD_STEP_GLSL,
    borderRadius: EMERALD_STEP_BORDER_RADIUS,
    cssGradient: emeraldStepCssGradient,
  },
  firework: {
    glsl: FIREWORK_GLSL,
    borderRadius: FIREWORK_BORDER_RADIUS,
    cssGradient: fireworkCssGradient,
  },
  jubilee: {
    glsl: JUBILEE_GLSL,
    borderRadius: JUBILEE_BORDER_RADIUS,
    cssGradient: jubileeCssGradient,
  },
  rose: {
    glsl: ROSE_GLSL,
    borderRadius: ROSE_BORDER_RADIUS,
    cssGradient: roseCssGradient,
  },
};

/** All cut GLSL functions concatenated in CUT_TYPES order, ready to inject into the fragment shader. */
export const ALL_CUT_GLSL: string = CUT_TYPES.map(
  (c) => CUT_MODULES[c].glsl,
).join("\n");
