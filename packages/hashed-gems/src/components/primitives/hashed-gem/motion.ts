import {
  getCutVariant,
  getShaderSeed,
  type CutType,
  type CutVariant,
  type GemType,
  type Rarity,
} from "@/lib/gem";

export const GEM_MOTION_STYLES = {
  crisp: 0,
  sweep: 1,
  bloom: 2,
  burst: 3,
} as const;

type GemMotionStyleName = keyof typeof GEM_MOTION_STYLES;

interface MotionTuning {
  motionCadence: number;
  lightCadence: number;
  sparkleCadence: number;
  glowCadence: number;
  colorCadence: number;
  motionIntensity: number;
  sparkleIntensity: number;
  glowIntensity: number;
}

export interface GemMotionProfile {
  motionStyle: number;
  motionCadence: number;
  lightCadence: number;
  sparkleCadence: number;
  glowCadence: number;
  colorCadence: number;
  motionIntensity: number;
  sparkleIntensity: number;
  glowIntensity: number;
  phaseOffset: number;
}

interface ResolveGemMotionProfileOptions {
  seed: string;
  gemType: GemType;
  cutType: CutType;
  rarity: Rarity;
}

const MOTION_STYLE_BY_CUT: Record<CutType, GemMotionStyleName> = {
  "round-brilliant": "crisp",
  princess: "crisp",
  "emerald-step": "sweep",
  cushion: "bloom",
  rose: "bloom",
  firework: "burst",
  jubilee: "burst",
};

const BASE_TUNING_BY_STYLE: Record<GemMotionStyleName, MotionTuning> = {
  crisp: {
    motionCadence: 1.04,
    lightCadence: 1.12,
    sparkleCadence: 1.2,
    glowCadence: 0.98,
    colorCadence: 0.92,
    motionIntensity: 1.0,
    sparkleIntensity: 1.12,
    glowIntensity: 0.94,
  },
  sweep: {
    motionCadence: 0.94,
    lightCadence: 1.06,
    sparkleCadence: 0.9,
    glowCadence: 0.94,
    colorCadence: 0.9,
    motionIntensity: 0.98,
    sparkleIntensity: 0.94,
    glowIntensity: 0.98,
  },
  bloom: {
    motionCadence: 0.82,
    lightCadence: 0.84,
    sparkleCadence: 0.76,
    glowCadence: 0.9,
    colorCadence: 0.82,
    motionIntensity: 0.94,
    sparkleIntensity: 0.86,
    glowIntensity: 1.08,
  },
  burst: {
    motionCadence: 0.98,
    lightCadence: 1.02,
    sparkleCadence: 1.04,
    glowCadence: 1.12,
    colorCadence: 0.9,
    motionIntensity: 1.04,
    sparkleIntensity: 1.0,
    glowIntensity: 1.12,
  },
};

const FAST_TIGHT_VARIANTS = new Set<CutVariant>([
  "tight",
  "compact",
  "compressed",
  "crisp",
  "starburst",
  "low-dome",
]);

const SLOW_BROAD_VARIANTS = new Set<CutVariant>([
  "open",
  "broad",
  "elongated",
  "full",
  "bloom",
  "high-crown",
  "soft",
]);

function fract(value: number): number {
  return value - Math.floor(value);
}

function hash11(value: number): number {
  return fract(Math.sin(value * 127.1) * 43758.5453);
}

function seededSpan(
  seed: number,
  salt: number,
  minValue: number,
  maxValue: number,
): number {
  return minValue + (maxValue - minValue) * hash11(seed * 0.173 + salt * 13.1);
}

function multiplyTuning(
  base: MotionTuning,
  tuning: MotionTuning,
): MotionTuning {
  return {
    motionCadence: base.motionCadence * tuning.motionCadence,
    lightCadence: base.lightCadence * tuning.lightCadence,
    sparkleCadence: base.sparkleCadence * tuning.sparkleCadence,
    glowCadence: base.glowCadence * tuning.glowCadence,
    colorCadence: base.colorCadence * tuning.colorCadence,
    motionIntensity: base.motionIntensity * tuning.motionIntensity,
    sparkleIntensity: base.sparkleIntensity * tuning.sparkleIntensity,
    glowIntensity: base.glowIntensity * tuning.glowIntensity,
  };
}

function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.min(Math.max(value, minValue), maxValue);
}

function getVariantTuning(cutVariant: CutVariant): MotionTuning {
  if (FAST_TIGHT_VARIANTS.has(cutVariant)) {
    return {
      motionCadence: 1.12,
      lightCadence: 1.08,
      sparkleCadence: 1.14,
      glowCadence: 0.96,
      colorCadence: 0.94,
      motionIntensity: 0.98,
      sparkleIntensity: 1.08,
      glowIntensity: 0.94,
    };
  }

  if (SLOW_BROAD_VARIANTS.has(cutVariant)) {
    return {
      motionCadence: 0.88,
      lightCadence: 0.92,
      sparkleCadence: 0.84,
      glowCadence: 1.04,
      colorCadence: 0.96,
      motionIntensity: 1.04,
      sparkleIntensity: 0.92,
      glowIntensity: 1.06,
    };
  }

  if (cutVariant === "squarish") {
    return {
      motionCadence: 0.9,
      lightCadence: 0.94,
      sparkleCadence: 0.88,
      glowCadence: 1.02,
      colorCadence: 0.98,
      motionIntensity: 0.96,
      sparkleIntensity: 0.94,
      glowIntensity: 1.04,
    };
  }

  return {
    motionCadence: 1,
    lightCadence: 1,
    sparkleCadence: 1,
    glowCadence: 1,
    colorCadence: 1,
    motionIntensity: 1,
    sparkleIntensity: 1,
    glowIntensity: 1,
  };
}

function getRarityTuning(rarity: Rarity): MotionTuning {
  switch (rarity) {
    case "common":
      return {
        motionCadence: 0.96,
        lightCadence: 0.98,
        sparkleCadence: 0.94,
        glowCadence: 0.96,
        colorCadence: 1,
        motionIntensity: 0.94,
        sparkleIntensity: 0.92,
        glowIntensity: 0.9,
      };
    case "uncommon":
      return {
        motionCadence: 1,
        lightCadence: 1,
        sparkleCadence: 1,
        glowCadence: 1,
        colorCadence: 1,
        motionIntensity: 1,
        sparkleIntensity: 1,
        glowIntensity: 1,
      };
    case "rare":
      return {
        motionCadence: 1.04,
        lightCadence: 1.04,
        sparkleCadence: 1.06,
        glowCadence: 1.08,
        colorCadence: 1,
        motionIntensity: 1.08,
        sparkleIntensity: 1.08,
        glowIntensity: 1.1,
      };
    case "epic":
      return {
        motionCadence: 1.08,
        lightCadence: 1.08,
        sparkleCadence: 1.1,
        glowCadence: 1.14,
        colorCadence: 1,
        motionIntensity: 1.16,
        sparkleIntensity: 1.16,
        glowIntensity: 1.24,
      };
    case "legendary":
      return {
        motionCadence: 1.12,
        lightCadence: 1.12,
        sparkleCadence: 1.16,
        glowCadence: 1.22,
        colorCadence: 1,
        motionIntensity: 1.24,
        sparkleIntensity: 1.28,
        glowIntensity: 1.36,
      };
  }
}

function getGemTypeTuning(gemType: GemType): MotionTuning {
  if (gemType === "alexandrite") {
    return {
      motionCadence: 0.94,
      lightCadence: 0.96,
      sparkleCadence: 0.94,
      glowCadence: 1.04,
      colorCadence: 0.7,
      motionIntensity: 1,
      sparkleIntensity: 0.96,
      glowIntensity: 1.12,
    };
  }

  if (gemType === "opal") {
    return {
      motionCadence: 0.96,
      lightCadence: 1.04,
      sparkleCadence: 1.02,
      glowCadence: 1.08,
      colorCadence: 0.72,
      motionIntensity: 1.04,
      sparkleIntensity: 1.08,
      glowIntensity: 1.16,
    };
  }

  if (gemType === "diamond" || gemType === "onyx") {
    return {
      motionCadence: 1.02,
      lightCadence: 1.04,
      sparkleCadence: 1.08,
      glowCadence: 1.02,
      colorCadence: 0.88,
      motionIntensity: 1.04,
      sparkleIntensity: 1.14,
      glowIntensity: 1.04,
    };
  }

  return {
    motionCadence: 1,
    lightCadence: 1,
    sparkleCadence: 0.98,
    glowCadence: 1.02,
    colorCadence: 0.94,
    motionIntensity: 1,
    sparkleIntensity: 0.98,
    glowIntensity: 1.04,
  };
}

export function resolveGemMotionProfile({
  seed,
  gemType,
  cutType,
  rarity,
}: ResolveGemMotionProfileOptions): GemMotionProfile {
  const seedNumber = getShaderSeed(seed);
  const cutVariant = getCutVariant(seed, cutType);
  const style = MOTION_STYLE_BY_CUT[cutType];

  const baseTuning = BASE_TUNING_BY_STYLE[style];
  const variantTuning = getVariantTuning(cutVariant);
  const rarityTuning = getRarityTuning(rarity);
  const gemTypeTuning = getGemTypeTuning(gemType);

  const tuning = multiplyTuning(
    multiplyTuning(multiplyTuning(baseTuning, variantTuning), rarityTuning),
    gemTypeTuning,
  );

  const cadenceJitter = seededSpan(seedNumber, 160, 0.97, 1.03);
  const lightJitter = seededSpan(seedNumber, 161, 0.95, 1.05);
  const sparkleJitter = seededSpan(seedNumber, 162, 0.95, 1.06);
  const glowJitter = seededSpan(seedNumber, 163, 0.96, 1.04);
  const colorJitter = seededSpan(seedNumber, 164, 0.96, 1.04);
  const motionJitter = seededSpan(seedNumber, 165, 0.98, 1.03);
  const sparkleIntensityJitter = seededSpan(seedNumber, 166, 0.97, 1.05);
  const glowIntensityJitter = seededSpan(seedNumber, 167, 0.97, 1.05);

  return {
    motionStyle: GEM_MOTION_STYLES[style],
    motionCadence: clamp(tuning.motionCadence * cadenceJitter, 0.62, 1.4),
    lightCadence: clamp(tuning.lightCadence * lightJitter, 0.64, 1.5),
    sparkleCadence: clamp(tuning.sparkleCadence * sparkleJitter, 0.58, 1.7),
    glowCadence: clamp(tuning.glowCadence * glowJitter, 0.64, 1.55),
    colorCadence: clamp(tuning.colorCadence * colorJitter, 0.52, 1.2),
    motionIntensity: clamp(tuning.motionIntensity * motionJitter, 0.78, 1.45),
    sparkleIntensity: clamp(
      tuning.sparkleIntensity * sparkleIntensityJitter,
      0.72,
      1.5,
    ),
    glowIntensity: clamp(tuning.glowIntensity * glowIntensityJitter, 0.74, 1.6),
    phaseOffset: seededSpan(seedNumber, 168, 0, Math.PI * 2),
  };
}
