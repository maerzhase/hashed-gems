import type { CutType } from "@/lib/gem";
import { CUT_TYPES } from "@/lib/gem";
import { ALL_CUT_GLSL } from "./cuts/index";

export const VERTEX_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// ── Fragment shader is assembled from three parts: ────────────────────────────
//   FRAGMENT_PREAMBLE  — version, uniforms, utility functions, CutResult struct
//   ALL_CUT_GLSL       — one GLSL function per cut type (from cuts/ modules)
//   FRAGMENT_MAIN      — dispatcher + void main() body
// Adding a new cut: create cuts/<name>.ts, register in cuts/index.ts. Done.

const CUT_TYPE_LABELS = CUT_TYPES.map((cut, index) => `${index}=${cut}`).join(
  " ",
);

const CUT_FUNCTIONS: Record<CutType, string> = {
  "round-brilliant": "computeRoundBrilliant",
  princess: "computePrincess",
  cushion: "computeCushion",
  "emerald-step": "computeEmeraldStep",
  firework: "computeFirework",
  jubilee: "computeJubilee",
  rose: "computeRose",
};

const CUT_INDEX = Object.fromEntries(
  CUT_TYPES.map((cut, index) => [cut, index]),
) as Record<CutType, number>;

const CUT_DISPATCH_LINES = CUT_TYPES.slice(1)
  .map(
    (cut, index) =>
      `  if (cutType == ${index + 1}) return ${CUT_FUNCTIONS[cut]}(uv, seed);`,
  )
  .join("\n");

const FRAGMENT_PREAMBLE = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

#define PI     3.14159265359
#define TWO_PI 6.28318530718
#define GEM_CANVAS_SCALE 1.0
#define GEM_FILL_TARGET 0.985

uniform float uTime;
uniform float uSeed;
uniform int   uCausticCount;
uniform vec2  uResolution;
uniform int   uGemType;  // 0=diamond 1=ruby 2=sapphire 3=emerald 4=topaz 5=amethyst 6=aquamarine
                         // 7=rose-quartz 8=citrine 9=onyx 10=alexandrite 11=opal
uniform int   uCutType;  // ${CUT_TYPE_LABELS}
uniform int   uRarity;   // 0=common 1=uncommon 2=rare 3=epic 4=legendary
uniform int   uMotionStyle; // 0=crisp 1=sweep 2=bloom 3=burst
uniform float uMotionCadence;
uniform float uLightCadence;
uniform float uSparkleCadence;
uniform float uGlowCadence;
uniform float uFlareCadence;
uniform float uColorCadence;
uniform float uMotionIntensity;
uniform float uSparkleIntensity;
uniform float uGlowIntensity;
uniform float uFlareIntensity;
uniform float uMotionPhase;

in  vec2 vUv;
out vec4 outColor;

/* ── Utilities ─────────────────────────────────────────────────────────────── */

vec3 hue2rgb(float h) {
  return clamp(vec3(abs(h*6.0-3.0)-1.0, 2.0-abs(h*6.0-2.0), 2.0-abs(h*6.0-4.0)), 0.0, 1.0);
}

float hash11(float p) { return fract(sin(p * 127.1) * 43758.5453); }
float hash21(vec2 p)  { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float seededSpan(float seed, float salt, float minValue, float maxValue) {
  return mix(minValue, maxValue, hash11(seed * 0.173 + salt * 13.1));
}

float f0FromIOR(float n) { float x = (1.0 - n) / (1.0 + n); return x * x; }

float fresnelSchlick(float f0v, float cosT) {
  return f0v + (1.0 - f0v) * pow(clamp(1.0 - cosT, 0.0, 1.0), 5.0);
}

float motionClock(float cadence, float offset) {
  return uTime * cadence + uMotionPhase + offset;
}

float styleWeight(int style) {
  return float(uMotionStyle == style);
}

vec2 rotate2D(vec2 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec3 rotateAroundX(vec3 v, float angle) {
  vec2 yz = rotate2D(v.yz, angle);
  return vec3(v.x, yz.x, yz.y);
}

vec3 rotateAroundY(vec3 v, float angle) {
  vec2 xz = rotate2D(vec2(v.x, v.z), angle);
  return vec3(xz.x, v.y, xz.y);
}

vec3 rotateAroundZ(vec3 v, float angle) {
  vec2 xy = rotate2D(v.xy, angle);
  return vec3(xy.x, xy.y, v.z);
}

float easedSine(float x) {
  return sin(x) * 0.72 + sin(x * 0.5 + 1.0471975512) * 0.28;
}

float bounceResponse(
  vec3 lightDir,
  vec3 entryNormal,
  vec3 bounceNormal,
  vec3 exitNormal,
  vec3 viewDirection,
  float ior,
  float sharpness
) {
  vec3 entry = refract(-lightDir, entryNormal, 1.0 / ior);
  float entered = step(0.0001, dot(entry, entry));
  entry = normalize(entry + bounceNormal * 0.0001);

  vec3 bounced = reflect(entry, bounceNormal);
  vec3 exited = refract(bounced, -exitNormal, ior);
  float hasExit = step(0.0001, dot(exited, exited));
  vec3 exitDir = normalize(mix(bounced, exited, hasExit));

  return pow(max(dot(exitDir, viewDirection), 0.0), sharpness) * entered;
}

vec4 reverseRefractiveExit(
  vec3 viewDirection,
  vec3 entryNormal,
  vec3 bounceNormal,
  vec3 exitNormal,
  float ior
) {
  vec3 entry = refract(-viewDirection, entryNormal, 1.0 / ior);
  float entered = step(0.0001, dot(entry, entry));
  entry = normalize(mix(reflect(-viewDirection, entryNormal), entry, entered) + bounceNormal * 0.0001);

  vec3 bounced = reflect(entry, bounceNormal);
  vec3 exited = refract(bounced, -exitNormal, ior);
  float hasExit = step(0.0001, dot(exited, exited));
  vec3 exitDir = normalize(mix(bounced, exited, hasExit));

  return vec4(exitDir, entered * mix(0.55, 1.0, hasExit));
}

vec4 reverseRefractiveChainExit(
  vec3 viewDirection,
  vec3 entryNormal,
  vec3 bounceNormalA,
  vec3 bounceNormalB,
  vec3 exitNormal,
  float ior
) {
  vec3 entry = refract(-viewDirection, entryNormal, 1.0 / ior);
  float entered = step(0.0001, dot(entry, entry));
  entry = normalize(mix(reflect(-viewDirection, entryNormal), entry, entered) + bounceNormalA * 0.0001);

  vec3 bouncedA = reflect(entry, bounceNormalA);
  vec3 bouncedB = reflect(normalize(bouncedA + bounceNormalB * 0.0001), bounceNormalB);
  vec3 exited = refract(bouncedB, -exitNormal, ior);
  float hasExit = step(0.0001, dot(exited, exited));
  vec3 exitDir = normalize(mix(bouncedB, exited, hasExit));

  return vec4(exitDir, entered * mix(0.45, 1.0, hasExit));
}

/* ── Spectral: wavelength → RGB ───────────────────────────────────────────── */
/* CIE-like color matching approximation for 380–700 nm visible spectrum.     */

vec3 spectralColor(float wl) {
  vec3 c;
  if      (wl < 440.0) c = vec3(-(wl-440.0)/60.0, 0.0, 1.0);
  else if (wl < 490.0) c = vec3(0.0, (wl-440.0)/50.0, 1.0);
  else if (wl < 510.0) c = vec3(0.0, 1.0, -(wl-510.0)/20.0);
  else if (wl < 580.0) c = vec3((wl-510.0)/70.0, 1.0, 0.0);
  else if (wl < 645.0) c = vec3(1.0, -(wl-645.0)/65.0, 0.0);
  else                 c = vec3(1.0, 0.0, 0.0);
  // Intensity rolloff at spectrum edges
  float f;
  if      (wl < 420.0) f = 0.3 + 0.7 * (wl - 380.0) / 40.0;
  else if (wl > 645.0) f = 0.3 + 0.7 * (700.0 - wl) / 55.0;
  else                 f = 1.0;
  return c * f;
}

/* ── HDR Studio Environment ───────────────────────────────────────────────── */

float sampleEnv(vec3 d) {
  float crispStyle = styleWeight(0);
  float sweepStyle = styleWeight(1);
  float bloomStyle = styleWeight(2);
  float burstStyle = styleWeight(3);
  float env = 0.02;
  env += max(0.0, d.z) * 0.06;

  float studioPhase = uSeed * 0.43 + crispStyle * 0.21 + sweepStyle * 0.49 + bloomStyle * 0.73 + burstStyle * 0.91;

  vec3 w1 = normalize(vec3(
    cos(studioPhase * mix(0.96, 0.78, sweepStyle) + uSeed) * mix(0.5, 0.72, sweepStyle),
    sin(studioPhase * mix(0.58, 0.42, crispStyle) + sweepStyle * 0.6) * mix(0.3, 0.38, bloomStyle),
    mix(0.82, 0.88, bloomStyle)
  ));
  env += pow(max(0.0, dot(d, w1)), mix(8.0, 10.0, crispStyle)) * mix(8.0, 6.8, bloomStyle) * (0.92 + 0.16 * uMotionIntensity);

  vec3 w2 = normalize(vec3(
    -cos(studioPhase * mix(0.74, 0.52, bloomStyle) + uSeed * 0.7) * mix(0.4, 0.56, sweepStyle),
    cos(studioPhase * mix(0.46, 0.34, crispStyle) + burstStyle * 0.5) * mix(0.5, 0.36, bloomStyle),
    mix(0.72, 0.8, sweepStyle)
  ));
  env += pow(max(0.0, dot(d, w2)), mix(12.0, 9.0, bloomStyle)) * mix(3.0, 3.8, burstStyle) * (0.94 + 0.12 * uMotionIntensity);

  vec3 s1 = normalize(vec3(
    sin(studioPhase * mix(1.34, 1.04, bloomStyle) + uSeed * 1.3) * mix(0.7, 0.5, bloomStyle),
    cos(studioPhase * mix(1.08, 0.84, bloomStyle) + crispStyle * 0.4) * mix(0.7, 0.52, bloomStyle),
    mix(0.5, 0.62, sweepStyle)
  ));
  env += pow(max(0.0, dot(d, s1)), mix(80.0, 68.0, bloomStyle)) * mix(45.0, 54.0, burstStyle) * (0.9 + 0.18 * uMotionIntensity);

  vec3 s2 = normalize(vec3(
    cos(studioPhase * mix(0.98, 0.76, bloomStyle) - uSeed * 0.9) * mix(0.6, 0.76, burstStyle),
    -sin(studioPhase * mix(1.42, 1.12, bloomStyle) + sweepStyle * 0.7) * mix(0.6, 0.5, bloomStyle),
    mix(0.58, 0.66, burstStyle)
  ));
  env += pow(max(0.0, dot(d, s2)), mix(64.0, 74.0, crispStyle)) * mix(30.0, 38.0, burstStyle) * (0.9 + 0.16 * uMotionIntensity);

  float equator = 1.0 - abs(d.z);
  env += pow(equator, 3.0) * 1.2;

  env += 0.06 * max(0.0, sin(d.x*7.0 + d.y*5.0 + uSeed*0.7) * cos(d.y*6.0 - d.x*4.0 + uSeed * 0.31));
  env += 0.04 * max(0.0, sin(d.x*13.0 + d.z*9.0 + uSeed*1.3) * cos(d.y*11.0 - d.z*7.0 + uSeed * 0.79));

  env += max(0.0, -d.z) * 0.06;
  return env;
}

/* ── Sellmeier dispersion — physical IOR per wavelength ──────────────────── */

float diamondIOR(float wavNm) {
  float l2 = wavNm * wavNm;
  return sqrt(1.0 + 4.658 * l2 / (l2 - 112.5));
}

/* ── ACES Filmic Tonemap ─────────────────────────────────────────────────── */

vec3 tonemap(vec3 x) {
  x *= 0.55;
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

/* ══════════════════════════════════════════════════════════════════════════════ */

/* ── Cut result struct — returned by every per-cut geometry function ────────── */
struct CutResult {
  vec3  normal;    /* facet surface normal                          */
  int   facetId;   /* unique ID per facet (drives per-facet blink)  */
  float edgeMask;  /* 0-1 facet boundary intensity                  */
};
`;

// ── Dispatcher — generated from CUT_TYPES order in gem.ts ─────────────────────
const FRAGMENT_DISPATCHER = /* glsl */ `
CutResult computeCut(int cutType, vec2 uv, float seed) {
${CUT_DISPATCH_LINES}
  return ${CUT_FUNCTIONS[CUT_TYPES[0]]}(uv, seed);
}
`;

const FRAGMENT_MAIN = /* glsl */ `
void main() {

  /* ── 1. Coordinates ──────────────────────────────────────────────────── */
  vec2 uv = vUv;
  uv.x *= uResolution.x / uResolution.y;
  uv *= GEM_CANVAS_SCALE;

  float r = max(abs(uv.x), abs(uv.y));
  float radNorm = clamp(r / GEM_CANVAS_SCALE, 0.0, 1.0);

  vec3 viewDir = normalize(vec3(-uv * 0.12, 1.0));

  /* ── 2. Gem optical properties ─────────────────────────────────────────── */
  float ior, dispAmt;
  vec3  absorbCoeff;
  vec3  gemBodyColor;
  bool  isAlexandrite = false;
  bool  isOpal        = false;
  float crispStyle = styleWeight(0);
  float sweepStyle = styleWeight(1);
  float bloomStyle = styleWeight(2);
  float burstStyle = styleWeight(3);
  float motionTime = motionClock(uMotionCadence, 0.0);

  if      (uGemType == 0) { ior=2.42; dispAmt=0.044; absorbCoeff=vec3(0.0);
    gemBodyColor = mix(vec3(0.96,0.97,1.0), vec3(1.0,0.96,0.90), 0.5+0.5*sin(uSeed*0.137)); }
  else if (uGemType == 1) { ior=1.77; dispAmt=0.018; absorbCoeff=vec3(0.15,3.5,3.0);
    gemBodyColor = vec3(1.0, 0.04, 0.06); }
  else if (uGemType == 2) { ior=1.77; dispAmt=0.018; absorbCoeff=vec3(3.0,1.8,0.10);
    gemBodyColor = vec3(0.03, 0.10, 1.0); }
  else if (uGemType == 3) { ior=1.58; dispAmt=0.014; absorbCoeff=vec3(2.5,0.12,2.0);
    gemBodyColor = vec3(0.03, 1.0, 0.12); }
  else if (uGemType == 4) { ior=1.61; dispAmt=0.014; absorbCoeff=vec3(0.10,0.5,2.5);
    gemBodyColor = vec3(1.0, 0.78, 0.06); }
  else if (uGemType == 5) { ior=1.54; dispAmt=0.013; absorbCoeff=vec3(0.7,2.5,0.25);
    gemBodyColor = vec3(0.72, 0.03, 1.0); }
  else if (uGemType == 6) { ior=1.57; dispAmt=0.014; absorbCoeff=vec3(2.0,0.35,0.12);
    gemBodyColor = vec3(0.05, 0.82, 1.0); }
  // ── New gem types ──
  else if (uGemType == 7) { ior=1.54; dispAmt=0.013; absorbCoeff=vec3(0.20,1.8,1.5);
    gemBodyColor = vec3(1.0, 0.45, 0.65); } // Rose Quartz — soft pink
  else if (uGemType == 8) { ior=1.54; dispAmt=0.014; absorbCoeff=vec3(0.08,0.9,3.2);
    gemBodyColor = vec3(1.0, 0.55, 0.05); } // Citrine — warm orange
  else if (uGemType == 9) { ior=2.42; dispAmt=0.044; absorbCoeff=vec3(6.0,6.0,5.5);
    gemBodyColor = vec3(0.03, 0.03, 0.04); } // Onyx — near-black, surface-dominant
  else if (uGemType == 10) { ior=1.746; dispAmt=0.015; isAlexandrite=true;
    // Alexandrite: seed-driven daylight/incandescent balance, kept stable over time
    float alexT = 0.5 + 0.5 * sin(uSeed * 0.7);
    absorbCoeff = mix(vec3(2.8, 0.15, 1.2), vec3(0.18, 2.8, 2.5), alexT);
    gemBodyColor = mix(vec3(0.08, 0.85, 0.35), vec3(0.90, 0.10, 0.45), alexT); }
  else { ior=1.45; dispAmt=0.012; isOpal=true;
    absorbCoeff = vec3(0.3, 0.25, 0.2);
    gemBodyColor = vec3(0.92, 0.90, 0.88); } // Opal — base milky white

  float f0 = f0FromIOR(ior);

  // Rarity-based sparkle multiplier (computed here, applied later)
  float raritySparkle = 1.0;
  float rarityGlow    = 0.0;
  float rarityFlare   = 0.0;
  if      (uRarity == 1) { raritySparkle = 1.05; }
  else if (uRarity == 2) { raritySparkle = 1.1; rarityGlow = 0.04; rarityFlare = 0.92; }
  else if (uRarity == 3) { raritySparkle = 1.2; rarityGlow = 0.06; rarityFlare = 1.56; }
  else if (uRarity == 4) { raritySparkle = 1.35; rarityGlow = 0.10; rarityFlare = 2.12; }
  if (uRarity == 1) rarityFlare = 0.16;

  float rarityTier = float(uRarity) / 4.0;
  float rarityTravel = mix(0.82, 1.14, rarityTier);
  float rarityComplexity = mix(0.84, 1.2, rarityTier);
  float rarityDepth = mix(0.74, 1.42, rarityTier);
  float rarityContrast = mix(0.9, 1.12, rarityTier);
  float outerFragmentZone = smoothstep(0.58, 0.94, radNorm);
  float outerNeedleZone = smoothstep(0.46, 0.86, radNorm);
  float outerSpikeSoftener = mix(1.0, 0.62, outerFragmentZone);
  float outerDeepSoftener = mix(1.0, 0.34, outerNeedleZone);
  if (uCutType == ${CUT_INDEX["round-brilliant"]}) {
    outerFragmentZone = smoothstep(0.5, 0.9, radNorm);
    outerNeedleZone = smoothstep(0.4, 0.82, radNorm);
    outerSpikeSoftener = mix(1.0, 0.5, outerFragmentZone);
    outerDeepSoftener = mix(1.0, 0.18, outerNeedleZone);
  }

  /* ── 3. Crown facet geometry — dispatched to per-cut module ─────────────── */
  CutResult cut     = computeCut(uCutType, uv, uSeed);
  vec3  crownNormal = cut.normal;
  int   facetId     = cut.facetId;
  float edgeMask    = cut.edgeMask;

  float gemYaw = easedSine(motionTime * mix(0.42, 0.31, bloomStyle) + uSeed * 0.9)
    * mix(0.12, 0.16, sweepStyle)
    * (0.9 + 0.22 * uMotionIntensity)
    * rarityTravel;
  float gemPitch = easedSine(motionTime * mix(0.28, 0.21, bloomStyle) + uSeed * 1.7 + 1.57079632679)
    * mix(0.05, 0.075, crispStyle + burstStyle * 0.3)
    * (0.88 + 0.2 * uMotionIntensity)
    * mix(0.84, 1.08, rarityTravel);
  float gemRoll = easedSine(motionTime * mix(0.2, 0.15, burstStyle + bloomStyle * 0.4) + uSeed * 2.3)
    * mix(0.035, 0.06, burstStyle + crispStyle * 0.25)
    * (0.86 + 0.18 * uMotionIntensity)
    * mix(0.8, 1.1, rarityTravel);

  /* ── 4. Internal facet layer ───────────────────────────────────────────── */
  float iFolds = floor(seededSpan(uSeed, 1.0, 22.0, 30.999));
  float iAng = atan(uv.y, uv.x) + 0.43 + uSeed * 0.29;
  float iWarp = seededSpan(uSeed, 2.0, 0.010, 0.040) * cos(iAng * seededSpan(uSeed, 3.0, 4.0, 8.0) + uSeed * 0.91);
  float iRad = clamp((r / GEM_CANVAS_SCALE) / (1.0 + iWarp), 0.0, 1.0);
  float iSw  = PI / iFolds;
  float iOa  = mod(iAng + iSw*0.5, iSw) - iSw*0.5;
  float iOi  = floor((iAng + iSw*0.5) / iSw);
  float ij   = 0.018 * sin(uSeed*5.1 + iOi*1.8);
  float iBandScale = 0.95 + 0.12 * hash11(uSeed * 0.31 + iOi * 0.67);
  float iw1 = seededSpan(uSeed, 4.0, 0.11, 0.16) * iBandScale;
  float iw2 = seededSpan(uSeed, 5.0, 0.12, 0.20) * (0.94 + 0.10 * hash11(uSeed * 0.37 + iOi * 0.43));
  float iw3 = seededSpan(uSeed, 6.0, 0.12, 0.18) * (0.96 + 0.10 * hash11(uSeed * 0.41 + iOi * 0.53));
  float iw4 = seededSpan(uSeed, 7.0, 0.10, 0.16) * (0.94 + 0.08 * hash11(uSeed * 0.47 + iOi * 0.59));
  float iw5 = seededSpan(uSeed, 8.0, 0.10, 0.14);
  float iz1 = iw1 + ij;
  float iz2 = iz1 + iw2;
  float iz3 = iz2 + iw3;
  float iz4 = iz3 + iw4;
  float iz5 = min(GEM_CANVAS_SCALE, iz4 + iw5);

  vec3  innerNormal  = vec3(0.0, 0.0, 1.0);
  int   innerFacetId = 100;
  float innerTableEdge = 0.0;

  if (iRad < iz1) {
    float cSw = PI / 4.0;
    float cOa = mod(iAng + cSw*0.5, cSw) - cSw*0.5;
    float cOi = floor((iAng + cSw*0.5) / cSw);
    float cA = cOi * cSw + cSw * 0.5 + 0.10 * sin(uSeed * 1.3 + cOi * 0.8);
    float cTilt = 0.065 + 0.022 * sin(uSeed * 2.0 + cOi * 1.1);
    cTilt *= 0.78 + 0.22 * (1.0 - smoothstep(0.0, iz1, iRad));
    innerNormal = normalize(vec3(cos(cA) * cTilt, sin(cA) * cTilt, 1.0 - cTilt));
    innerFacetId = 400 + int(cOi);
    float cDa = cSw*0.5 - abs(cOa);
    innerTableEdge = (1.0 - smoothstep(0.0, 0.020, cDa)) * smoothstep(0.012, iz1, iRad) * 0.40;
  } else {
    float outA = iOi * iSw + iSw * 0.5;
    float tilt;
    if      (iRad < iz2) { tilt = 0.30+0.09*sin(uSeed*2.1+iOi*0.83); innerFacetId = 101+int(iOi); }
    else if (iRad < iz3) { tilt = 0.54+0.11*cos(uSeed*3.1+iOi*0.71); innerFacetId = 125+int(iOi); }
    else if (iRad < iz4) { tilt = 0.70+0.08*sin(uSeed*1.7+iOi*1.10); innerFacetId = 149+int(iOi); }
    else                 { tilt = 0.87+0.05*sin(uSeed*2.5+iOi*0.90); innerFacetId = 173+int(iOi); }
    innerNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0 - tilt));
  }

  float iDr = min(min(min(abs(iRad-iz1), abs(iRad-iz2)), abs(iRad-iz3)),
                  min(abs(iRad-iz4), abs(iRad-iz5)));
  float iDa = min(iSw*0.5 - abs(iOa), abs(iOa));
  float innerEdge = max(1.0 - smoothstep(0.0, 0.008, min(iDa, iDr)), innerTableEdge);

  /* ── 5. Deep internal layer ────────────────────────────────────────────── */
  float dFolds = floor(seededSpan(uSeed, 9.0, 28.0, 38.999));
  float dAng = atan(uv.y, uv.x) - 0.67 + uSeed * 0.41;
  float dWarp = seededSpan(uSeed, 10.0, 0.012, 0.050) * sin(dAng * seededSpan(uSeed, 11.0, 5.0, 11.0) - uSeed * 0.73);
  float dRad = clamp((r / GEM_CANVAS_SCALE) / (1.0 + dWarp), 0.0, 1.0);
  float dSw  = PI / dFolds;
  float dOa  = mod(dAng + dSw*0.5, dSw) - dSw*0.5;
  float dOi  = floor((dAng + dSw*0.5) / dSw);
  float dj   = 0.016 * sin(uSeed*3.7 + dOi*2.1);
  float dBandScale = 0.94 + 0.12 * hash11(uSeed * 0.29 + dOi * 0.71);
  float dw1 = seededSpan(uSeed, 12.0, 0.10, 0.15) * dBandScale;
  float dw2 = seededSpan(uSeed, 13.0, 0.11, 0.18) * (0.94 + 0.10 * hash11(uSeed * 0.43 + dOi * 0.37));
  float dw3 = seededSpan(uSeed, 14.0, 0.11, 0.17) * (0.96 + 0.08 * hash11(uSeed * 0.51 + dOi * 0.47));
  float dw4 = seededSpan(uSeed, 15.0, 0.10, 0.15) * (0.94 + 0.08 * hash11(uSeed * 0.57 + dOi * 0.41));
  float dw5 = seededSpan(uSeed, 16.0, 0.09, 0.13);
  float dz1 = dw1 + dj;
  float dz2 = dz1 + dw2;
  float dz3 = dz2 + dw3;
  float dz4 = dz3 + dw4;
  float dz5 = min(0.86, dz4 + dw5);

  vec3  deepNormal  = vec3(0.0, 0.0, 1.0);
  int   deepFacetId = 200;
  float deepTableEdge = 0.0;

  if (dRad < dz1) {
    float cSw = PI / 6.0;
    float cOa = mod(dAng + cSw*0.5, cSw) - cSw*0.5;
    float cOi = floor((dAng + cSw*0.5) / cSw);
    float cA = cOi * cSw + cSw * 0.5 - 0.12 * cos(uSeed * 1.7 + cOi * 0.6);
    float cTilt = 0.082 + 0.026 * cos(uSeed * 2.4 + cOi * 0.9);
    cTilt *= 0.76 + 0.24 * (1.0 - smoothstep(0.0, dz1, dRad));
    deepNormal = normalize(vec3(cos(cA) * cTilt, sin(cA) * cTilt, 1.0 - cTilt));
    deepFacetId = 500 + int(cOi);
    float cDa = cSw*0.5 - abs(cOa);
    deepTableEdge = (1.0 - smoothstep(0.0, 0.018, cDa)) * smoothstep(0.010, dz1, dRad) * 0.34;
  } else {
    float outA = dOi * dSw + dSw * 0.5;
    float tilt;
    if      (dRad < dz2) { tilt = 0.26+0.08*sin(uSeed*1.9+dOi*0.67); deepFacetId = 201+int(dOi); }
    else if (dRad < dz3) { tilt = 0.48+0.10*cos(uSeed*2.7+dOi*0.53); deepFacetId = 233+int(dOi); }
    else if (dRad < dz4) { tilt = 0.66+0.07*sin(uSeed*1.3+dOi*0.91); deepFacetId = 265+int(dOi); }
    else                 { tilt = 0.82+0.04*sin(uSeed*2.1+dOi*0.77); deepFacetId = 297+int(dOi); }
    deepNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0 - tilt));
  }

  float dDr = min(min(min(abs(dRad-dz1), abs(dRad-dz2)), abs(dRad-dz3)),
                  min(abs(dRad-dz4), abs(dRad-dz5)));
  float dDa = min(dSw*0.5 - abs(dOa), abs(dOa));
  float deepEdge = max(1.0 - smoothstep(0.0, 0.006, min(dDa, dDr)), deepTableEdge);

  crownNormal = rotateAroundZ(rotateAroundY(rotateAroundX(crownNormal, gemPitch), gemYaw), gemRoll);
  innerNormal = rotateAroundZ(rotateAroundY(rotateAroundX(innerNormal, gemPitch), gemYaw), gemRoll);
  deepNormal = rotateAroundZ(rotateAroundY(rotateAroundX(deepNormal, gemPitch), gemYaw), gemRoll);

  /* ── 6. Fresnel + layer compositing ────────────────────────────────────── */
  float cosTheta = max(dot(crownNormal, viewDir), 0.0);
  float fresnel  = fresnelSchlick(f0, cosTheta);

  float seeThrough = (1.0 - fresnel) * pow(cosTheta, 0.4) * 0.55;

  vec3 internalNormal = normalize(mix(crownNormal, innerNormal, seeThrough));
  edgeMask = max(edgeMask, innerEdge * seeThrough * 2.5);

  float deepBlend = seeThrough * smoothstep(0.50, 0.15, radNorm) * 0.45;
  internalNormal = normalize(mix(internalNormal, deepNormal, deepBlend));
  edgeMask = max(edgeMask, deepEdge * deepBlend * 3.0);

  if      (deepBlend  > 0.15) facetId = deepFacetId;
  else if (seeThrough > 0.22) facetId = innerFacetId;

  float imp = hash21(uv * 37.0 + vec2(uSeed * 0.13, uSeed * 0.27));
  crownNormal = normalize(crownNormal + vec3(imp * 0.012, imp * 0.008, 0.0));

  float ltPrimary = motionClock(uLightCadence * 0.24, 0.41);
  float ltSecondary = motionClock(uLightCadence * 0.15, 1.13);
  float ltTertiary = motionClock(uLightCadence * 0.1, 2.07);
  vec3 l1 = normalize(vec3(
    cos(ltPrimary*mix(0.86, 0.68, sweepStyle)+uSeed + 0.22 * rarityComplexity * sin(ltTertiary + uSeed * 0.4))*mix(0.62, 0.8, sweepStyle),
    sin(ltPrimary*mix(0.54, 0.4, crispStyle) + 0.18 * rarityComplexity * cos(ltSecondary * 0.8 + uSeed))*mix(0.42, 0.5, bloomStyle),
    mix(0.7, 0.82, bloomStyle) + 0.08 * rarityComplexity * sin(ltSecondary * 0.9 + uSeed * 0.6) + 0.04 * rarityComplexity * cos(ltTertiary * 1.1)
  ));
  vec3 l2 = normalize(vec3(
    sin(ltPrimary*mix(1.26, 1.0, bloomStyle)+uSeed*1.3 + 0.24 * rarityComplexity * sin(ltTertiary * 1.3))*mix(0.84, 0.62, bloomStyle),
    cos(ltSecondary*mix(1.12, 0.84, bloomStyle)+uSeed*0.3 + 0.16 * rarityComplexity * cos(ltPrimary * 0.7))*mix(0.74, 0.58, bloomStyle),
    mix(0.42, 0.58, sweepStyle) + 0.05 * rarityComplexity * cos(ltPrimary * 0.8 - uSeed * 0.4) + 0.04 * rarityComplexity * sin(ltTertiary * 0.9 + 0.8)
  ));
  vec3 l3 = normalize(vec3(
    cos(ltSecondary*mix(0.96, 0.78, bloomStyle)-uSeed*0.9 + 0.18 * rarityComplexity * sin(ltTertiary * 0.8 + uSeed))*mix(0.74, 0.92, burstStyle),
    -sin(ltPrimary*mix(1.38, 1.06, bloomStyle)+uSeed*0.2 + 0.14 * rarityComplexity * cos(ltSecondary * 1.1))*mix(0.68, 0.58, bloomStyle),
    mix(0.48, 0.62, burstStyle) + 0.06 * rarityComplexity * sin(ltSecondary * 1.1 + uSeed * 1.1) + 0.05 * rarityComplexity * cos(ltTertiary * 1.2)
  ));
  vec3 l4 = normalize(vec3(
    -cos(ltSecondary * 0.74 + uSeed * 1.9 + 0.25 * rarityComplexity * sin(ltTertiary)) * 0.52,
    sin(ltPrimary * 0.58 + uSeed * 0.8 + 0.18 * rarityComplexity * cos(ltTertiary * 1.4)) * 0.44,
    0.38 + 0.06 * rarityComplexity * cos(ltSecondary * 0.7) + 0.05 * rarityComplexity * sin(ltTertiary * 0.9 + uSeed * 0.3)
  ));
  vec3 lightSweepDir = normalize(
    l1 * mix(0.56, 0.42, rarityTier)
    + l2 * mix(0.22, 0.24, rarityTier)
    + l3 * mix(0.14, 0.2, rarityTier)
    + l4 * mix(0.08, 0.14, rarityTier)
  );

  /* ── 7. Surface reflection ─────────────────────────────────────────────── */
  vec3  surfReflDir = reflect(-viewDir, crownNormal);
  float surfEnv     = sampleEnv(surfReflDir);
  vec3  surfaceLight = vec3(surfEnv * 1.4) * fresnel;

  /* ── 8. Internal light — 7-sample spectral rendering ───────────────────── */
  /* We now combine the older reflected-fire model with reverse refractive   */
  /* transport: from the eye, trace back through crown entry, one or two     */
  /* internal bounces, and a proxy exit direction, then sample the studio    */
  /* environment along those exit directions.                                */

  vec3  intReflDir = reflect(-viewDir, internalNormal);
  vec3  dispAxis   = normalize(cross(intReflDir, internalNormal + vec3(0.001, 0.0, 0.0)));
  vec3 exitNormalPrimary = normalize(mix(crownNormal, internalNormal, 0.18));
  vec3 exitNormalDeep = normalize(mix(crownNormal, deepNormal, 0.24));
  vec3 exitNormalChain = normalize(mix(crownNormal, normalize(innerNormal + deepNormal), 0.22));

  // 7 wavelengths spanning visible spectrum (400–660 nm)
  vec3 reflectedSpectralAccum = vec3(0.0);
  vec3 refractedSpectralAccum = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    float wl = 400.0 + float(i) * 43.3; // 400, 443, 487, 530, 573, 617, 660
    float wlIOR;
    if (uGemType == 0 || uGemType == 9) {
      // Diamond / Onyx: use Sellmeier
      wlIOR = diamondIOR(wl);
    } else {
      // Other gems: linear IOR spread
      wlIOR = ior + dispAmt * (wl - 530.0) / 260.0;
    }
    float offset = (wlIOR - ior) * 2.8;
    vec3 reflectedDir = normalize(intReflDir + dispAxis * offset);
    float reflectedSample = sampleEnv(reflectedDir);
    reflectedSpectralAccum += spectralColor(wl) * reflectedSample;

    vec4 refractPrimary = reverseRefractiveExit(
      viewDir,
      crownNormal,
      innerNormal,
      exitNormalPrimary,
      wlIOR
    );
    vec4 refractDeep = reverseRefractiveExit(
      viewDir,
      crownNormal,
      deepNormal,
      exitNormalDeep,
      wlIOR
    );
    vec4 refractChain = reverseRefractiveChainExit(
      viewDir,
      crownNormal,
      innerNormal,
      deepNormal,
      exitNormalChain,
      wlIOR
    );

    vec3 primaryAxis = normalize(cross(refractPrimary.xyz, exitNormalPrimary + vec3(0.001, 0.0, 0.0)));
    vec3 deepAxis = normalize(cross(refractDeep.xyz, exitNormalDeep + vec3(0.0, 0.001, 0.0)));
    vec3 chainAxis = normalize(cross(refractChain.xyz, exitNormalChain + vec3(0.0, 0.0, 0.001)));

    vec3 primaryDir = normalize(refractPrimary.xyz + primaryAxis * offset * 0.55);
    vec3 deepDir = normalize(refractDeep.xyz + deepAxis * offset * 0.72);
    vec3 chainDir = normalize(refractChain.xyz + chainAxis * offset * 0.88);

    vec3 broadPrimaryDir = normalize(mix(primaryDir, normalize(exitNormalPrimary + internalNormal * 0.45), outerFragmentZone * 0.28));
    vec3 broadDeepDir = normalize(mix(deepDir, normalize(exitNormalDeep + internalNormal * 0.75), outerNeedleZone * 0.62));
    vec3 broadChainDir = normalize(mix(chainDir, normalize(exitNormalChain + internalNormal), outerNeedleZone * 0.82));

    float refractedSample =
      sampleEnv(broadPrimaryDir) * refractPrimary.w * (0.56 + 0.12 * rarityDepth) * seeThrough * mix(1.0, 0.78, outerFragmentZone)
      + sampleEnv(broadDeepDir) * refractDeep.w * (0.28 + 0.1 * rarityDepth) * (0.32 + deepBlend * 0.7) * outerSpikeSoftener
      + sampleEnv(broadChainDir) * refractChain.w * (0.10 + 0.08 * rarityDepth) * (0.12 + deepBlend * 0.7) * outerDeepSoftener;

    refractedSpectralAccum += spectralColor(wl) * refractedSample;
  }
  vec3 reflectedEnv = reflectedSpectralAccum / 3.5;
  vec3 refractedEnv = refractedSpectralAccum / 3.5;
  vec3 spectralAccum = mix(reflectedEnv, refractedEnv, 0.68);

  // Per-facet extinction
  float fid    = float(facetId);
  float fHash  = hash11(fid * 1.731 + uSeed * 3.117);
  float facetSweep = 0.5 + 0.5 * dot(internalNormal, lightSweepDir);
  float extMix = pow(clamp(fHash * mix(0.64, 0.42, rarityTier) + facetSweep * mix(0.36, 0.58, rarityTier), 0.0, 1.0), 0.6);
  float extinction = mix(0.01, 4.0, extMix);

  float facing = max(dot(internalNormal, viewDir), 0.0);
  float facingReject = smoothstep(0.0, 0.30, facing);
  extinction *= max(facingReject, 0.15);

  // Beer-Lambert absorption
  float pathLen    = 0.35 * (1.0 + radNorm * 1.5);
  vec3  absorption = exp(-absorbCoeff * pathLen);
  vec3  primaryAbsorption = exp(-absorbCoeff * (0.22 + radNorm * 0.52 + seeThrough * 0.2));
  vec3  deepAbsorption = exp(-absorbCoeff * (0.34 + radNorm * 0.78 + deepBlend * 0.42));

  // Internal color tinting
  vec3 internalTint;
  if (uGemType == 0) {
    internalTint = gemBodyColor;
  } else if (isOpal) {
    // Opal keeps a seeded patch field, but no autonomous hue cycling.
    float oN1 = sin(uv.x*4.0 + uv.y*2.5 + uSeed*0.7);
    float oN2 = sin(uv.x*2.5 - uv.y*4.5 + uSeed*1.3);
    float oN3 = sin(uv.x*6.0 + uv.y*3.5 + uSeed*2.1);
    float opalHue = fract(oN1 * 0.3 + oN2 * 0.25 + oN3 * 0.15 + uSeed * 0.1);
    vec3 opalPlay = hue2rgb(opalHue) * 0.5 + vec3(0.2);
    internalTint = opalPlay * absorption;
  } else {
    internalTint = absorption * 2.2;
  }

  vec3 refractedTint = mix(primaryAbsorption, deepAbsorption, clamp(deepBlend * 1.4, 0.0, 1.0));
  if (uGemType == 0) {
    refractedTint *= mix(vec3(1.0), gemBodyColor, 0.55);
  } else if (isOpal) {
    refractedTint *= internalTint;
  } else {
    refractedTint *= gemBodyColor * 1.15;
  }

  vec3 internalLight =
    reflectedEnv * internalTint * extinction * (1.0 - fresnel) * 0.42
    + refractedEnv * refractedTint * extinction * (1.0 - fresnel) * 1.08;

  float centerMask = 1.0 - smoothstep(0.06, 0.32, radNorm);
  float centerStructure = clamp(length(crownNormal.xy) * 1.8 + length(internalNormal.xy) + edgeMask * 0.6, 0.0, 1.0);
  float centerFlatten = centerMask * (1.0 - smoothstep(0.16, 0.48, centerStructure));
  float centerAnim = centerMask * (0.35 + 0.65 * centerStructure);
  float centerBlinkContrast = mix(0.9, 1.12, smoothstep(0.24, 0.76, facetSweep));
  surfaceLight *= 1.0 - centerFlatten * 0.12;
  internalLight *= 1.0 - centerFlatten * 0.26;
  internalLight += gemBodyColor * centerFlatten * 0.035;
  surfaceLight *= mix(1.0, mix(0.94, 1.10, centerBlinkContrast), centerAnim * 0.22);
  internalLight *= mix(1.0, centerBlinkContrast, centerAnim * 0.38);

  /* ── 9. Combine ────────────────────────────────────────────────────────── */
  vec3 rawColor = surfaceLight + internalLight;
  float motionPresence = 0.96 + 0.06 * max(dot(crownNormal, lightSweepDir), 0.0);
  rawColor *= mix(1.0, motionPresence * rarityContrast, 0.18 * uMotionIntensity);

  /* ── 10. Cut-specific light patterns ───────────────────────────────────── */
  if (uCutType == ${CUT_INDEX["round-brilliant"]}) {
    float arrowAng  = atan(uv.y, uv.x);
    float arrowOa   = mod(arrowAng + PI/8.0, PI/4.0) - PI/8.0;
    float arrowMask = smoothstep(0.05, 0.13, abs(arrowOa));
    float arrowRad  = smoothstep(0.15, 0.35, radNorm) * smoothstep(0.78, 0.58, radNorm);
    rawColor *= 1.0 - (1.0 - arrowMask) * arrowRad * 0.35;
  }

  if (uCutType == ${CUT_INDEX.princess}) {
    float crossAng  = atan(uv.y, uv.x);
    float crossOa   = mod(crossAng + PI/4.0, PI/2.0) - PI/4.0;
    float crossMask = smoothstep(0.06, 0.18, abs(crossOa));
    float crossRad  = smoothstep(0.20, 0.40, radNorm) * smoothstep(0.85, 0.60, radNorm);
    rawColor *= 1.0 - (1.0 - crossMask) * crossRad * 0.25;
  }

  if (uCutType == ${CUT_INDEX.jubilee}) {
    float jubAng = atan(uv.y, uv.x);
    float bezelDist = abs(mod(jubAng + PI/8.0, PI/4.0) - PI/8.0);
    float starDist  = abs(mod(jubAng + PI/16.0, PI/8.0) - PI/16.0);
    float apexGlow = smoothstep(0.09, 0.0, radNorm);
    float bezelBloom = (1.0 - smoothstep(0.04, 0.14, bezelDist))
      * smoothstep(0.10, 0.22, radNorm)
      * smoothstep(0.48, 0.20, radNorm);
    float crossContrast = (1.0 - smoothstep(0.016, 0.060, starDist))
      * smoothstep(0.28, 0.42, radNorm)
      * smoothstep(0.86, 0.54, radNorm);
    rawColor += vec3(apexGlow * 0.22);
    rawColor += gemBodyColor * bezelBloom * 0.12;
    rawColor *= 1.0 - crossContrast * 0.16;
  }

  if (uCutType == ${CUT_INDEX.rose}) {
    float roseAng = atan(uv.y, uv.x);
    float petalDist = abs(mod(roseAng + PI/12.0, PI/6.0) - PI/12.0);
    float petalMask = 1.0 - smoothstep(0.03, 0.11, petalDist);
    float petalRing = smoothstep(0.10, 0.22, radNorm) * smoothstep(0.72, 0.46, radNorm);
    float apexGlow = smoothstep(0.16, 0.0, radNorm);
    rawColor += vec3(apexGlow * 0.16);
    rawColor += gemBodyColor * petalMask * petalRing * 0.10;
    rawColor *= 1.0 - (1.0 - petalMask) * petalRing * 0.10;
  }

  /* ── 11. Scintillation ─────────────────────────────────────────────────── */
  vec3 h1 = normalize(l1 + viewDir);
  vec3 h2 = normalize(l2 + viewDir);
  vec3 h3 = normalize(l3 + viewDir);
  vec3 h4 = normalize(l4 + viewDir);

  float shinBase, shinRange, spkThresh, spkIntensity;
  if (uCutType == ${CUT_INDEX["round-brilliant"]}) {
    shinBase = 1200.0; shinRange = 800.0; spkThresh = 0.60; spkIntensity = 35.0;
  } else if (uCutType == ${CUT_INDEX.princess}) {
    shinBase = 800.0;  shinRange = 500.0; spkThresh = 0.55; spkIntensity = 40.0;
  } else if (uCutType == ${CUT_INDEX.jubilee}) {
    shinBase = 700.0;  shinRange = 360.0; spkThresh = 0.53; spkIntensity = 24.0;
  } else if (uCutType == ${CUT_INDEX.rose}) {
    shinBase = 560.0;  shinRange = 280.0; spkThresh = 0.56; spkIntensity = 20.0;
  } else if (uCutType == ${CUT_INDEX.cushion}) {
    shinBase = 500.0;  shinRange = 300.0; spkThresh = 0.50; spkIntensity = 28.0;
  } else {
    shinBase = 300.0;  shinRange = 150.0; spkThresh = 0.72; spkIntensity = 12.0;
  }

  spkThresh = clamp(spkThresh - rarityTier * 0.04, 0.42, 0.85);

  // Rarity boosts sparkle intensity
  spkIntensity *= raritySparkle * uSparkleIntensity;

  float shin1 = max(shinBase + shinRange * (fHash - 0.5) * 0.65, 1.0);
  float shin2 = max(shinBase * 0.75 + shinRange * 0.8 * (hash11(fid * 0.83 + uSeed * 1.3) - 0.5) * 0.65, 1.0);
  float shin3 = max(shinBase * 0.85 + shinRange * 0.6 * (hash11(fid * 1.27 + uSeed * 0.57) - 0.5) * 0.65, 1.0);

  float spk1 = pow(max(0.0, dot(crownNormal, h1)), shin1);
  float spk2 = pow(max(0.0, dot(crownNormal, h2)), shin2);
  float spk3 = pow(max(0.0, dot(crownNormal, h3)), shin3);
  float innerSpk1 = pow(max(0.0, dot(innerNormal, h2)), max(shin1 * 0.48, 20.0));
  float innerSpk2 = pow(max(0.0, dot(innerNormal, h4)), max(shin2 * 0.42, 18.0));
  float deepSpk1 = pow(max(0.0, dot(deepNormal, h3)), max(shin2 * 0.34, 14.0));
  float deepSpk2 = pow(max(0.0, dot(deepNormal, h4)), max(shin3 * 0.3, 12.0));

  float glint1 = smoothstep(spkThresh, min(spkThresh + 0.12, 0.99), spk1);
  float glint2 = smoothstep(spkThresh + 0.04, min(spkThresh + 0.16, 0.995), spk2);
  float glint3 = smoothstep(spkThresh + 0.07, min(spkThresh + 0.19, 0.997), spk3);
  float innerGlint1 = smoothstep(spkThresh * 0.28, spkThresh * 0.28 + 0.16, innerSpk1);
  float innerGlint2 = smoothstep(spkThresh * 0.24, spkThresh * 0.24 + 0.16, innerSpk2);
  float deepGlint1 = smoothstep(spkThresh * 0.18, spkThresh * 0.18 + 0.14, deepSpk1);
  float deepGlint2 = smoothstep(spkThresh * 0.16, spkThresh * 0.16 + 0.14, deepSpk2);

  rawColor += vec3(glint1) * spkIntensity * 0.92;
  rawColor += vec3(glint2) * spkIntensity * 0.64;
  rawColor += vec3(glint3) * spkIntensity * 0.42;
  rawColor += vec3(innerGlint1) * spkIntensity * 0.17 * rarityDepth * outerSpikeSoftener;
  rawColor += vec3(innerGlint2) * spkIntensity * 0.14 * rarityDepth * outerSpikeSoftener;
  rawColor += vec3(deepGlint1) * spkIntensity * 0.1 * rarityDepth * outerDeepSoftener;
  rawColor += vec3(deepGlint2) * spkIntensity * 0.08 * rarityDepth * outerDeepSoftener;

  // Spectral sparkle — rainbow fire flashes
  float dispAngle = fract(fid * 0.618 + uSeed * 0.137);
  vec3 spkColor = (uGemType == 0 || uGemType == 9 || isOpal)
    ? hue2rgb(dispAngle)
    : vec3(1.0);
  float spkTotal = glint1 + glint2 * 0.7 + innerGlint1 * 0.35 * rarityDepth * outerSpikeSoftener + deepGlint1 * 0.2 * rarityDepth * outerDeepSoftener;
  rawColor += spkColor * spkTotal * spkIntensity * 0.04;

  float innerStructureSweep = max(dot(innerNormal, lightSweepDir), 0.0);
  float deepStructureSweep = max(dot(deepNormal, l4), 0.0);
  rawColor += gemBodyColor * rarityDepth * (
    innerStructureSweep * seeThrough * 0.08 * outerSpikeSoftener
    + deepStructureSweep * deepBlend * 0.06 * outerDeepSoftener
  );
  rawColor += gemBodyColor * max(dot(crownNormal, lightSweepDir), 0.0) * outerNeedleZone * 0.045;

  float bounceSharpInner = mix(16.0, 24.0, crispStyle);
  float bounceSharpDeep = mix(10.0, 16.0, burstStyle + bloomStyle * 0.4);
  float bounce1 = bounceResponse(l1, crownNormal, innerNormal, crownNormal, viewDir, ior, bounceSharpInner);
  float bounce2 = bounceResponse(l2, crownNormal, deepNormal, crownNormal, viewDir, ior, bounceSharpDeep);

  vec3 entry3 = refract(-l3, crownNormal, 1.0 / ior);
  float entered3 = step(0.0001, dot(entry3, entry3));
  entry3 = normalize(entry3 + innerNormal * 0.0001);
  vec3 bounceChain = reflect(reflect(entry3, innerNormal), deepNormal);
  vec3 exitChain = refract(bounceChain, -crownNormal, ior);
  float chainExit = step(0.0001, dot(exitChain, exitChain));
  vec3 chainDir = normalize(mix(bounceChain, exitChain, chainExit));
  float bounce3 = pow(max(dot(chainDir, viewDir), 0.0), mix(8.0, 13.0, burstStyle)) * entered3;

  vec3 bounceTint = (uGemType == 0 || uGemType == 9)
    ? mix(vec3(1.0), spkColor, 0.4)
    : gemBodyColor;
  float bounceEnergy = rarityDepth * (
    bounce1 * seeThrough * 0.42 * outerSpikeSoftener
    + bounce2 * deepBlend * 0.34 * outerDeepSoftener
    + bounce3 * deepBlend * 0.28 * outerDeepSoftener
  );
  rawColor += bounceTint * bounceEnergy * spkIntensity * 0.09;

  /* ── 12. Facet edge effects ────────────────────────────────────────────── */
  edgeMask *= 0.85 + 0.30 * hash21(uv * 47.0 + vec2(uSeed * 0.3));

  float edgeLit  = smoothstep(0.15, 0.6, spectralAccum.g * extinction);
  float edgeGlow = edgeMask * edgeLit * (0.4 + 0.52 * max(dot(internalNormal, lightSweepDir), 0.0)) * uGlowIntensity * mix(1.0, 0.9, outerFragmentZone);
  float edgeHue  = fract(atan(uv.y, uv.x) / TWO_PI * 3.0 + radNorm * 0.4 + dispAngle * 0.35);
  vec3  edgeColor = (uGemType == 0 || uGemType == 9) ? hue2rgb(edgeHue) : gemBodyColor * 1.2;
  rawColor += edgeColor * edgeGlow * 0.25;
  rawColor *= 1.0 - edgeMask * 0.10;

  /* ── 13. Rarity visual effects ─────────────────────────────────────────── */

  float flareClock = motionClock(uFlareCadence * 0.17, 2.61);
  float highlightPeak = max(
    max(glint1, glint2),
    max(glint3, max(innerGlint1 * 0.82 + innerGlint2 * 0.54, deepGlint1 * 0.6 + deepGlint2 * 0.42))
  );
  float crownSweep = max(dot(crownNormal, lightSweepDir), 0.0);
  float flareContinuity = smoothstep(0.12, 0.64, crownSweep) * (0.16 + 0.22 * spkTotal);
  float flarePeak = smoothstep(
    0.12,
    0.68,
    highlightPeak + spkTotal * 0.24 + bounceEnergy * 0.11 + crownSweep * 0.24
  );
  float flareShape = clamp(rarityFlare * 0.55, 0.0, 1.0);
  float flareDriver = mix(flareContinuity, flarePeak, clamp(rarityFlare * 1.25, 0.0, 1.0));
  float flarePulse = 0.94
    + 0.06 * sin(flareClock + uSeed * 1.7)
    + 0.04 * cos(flareClock * 0.72 - uSeed * 0.43);
  float flarePresence = flareDriver
    * flarePulse
    * rarityFlare
    * uFlareIntensity
    * (1.18 + 0.82 * rarityFlare);

  vec2 highlightAxis = l1.xy * (0.52 + glint1 * 0.42)
    + l2.xy * (0.24 + glint2 * 0.34)
    + l3.xy * (0.16 + glint3 * 0.24)
    + lightSweepDir.xy * (0.42 + crownSweep * 0.28);
  vec2 flareAxis = highlightAxis / max(length(highlightAxis), 0.0001);
  vec2 flareCenter = clamp(
    (
      l1.xy * (0.24 + glint1 * 0.32)
      + l2.xy * (0.12 + glint2 * 0.22)
      + lightSweepDir.xy * (0.16 + crownSweep * 0.18)
    ) * mix(0.22, 0.34, flareShape),
    vec2(-0.42),
    vec2(0.42)
  );
  vec2 flareNormal = vec2(-flareAxis.y, flareAxis.x);
  vec2 flareOffset = uv - flareCenter;
  float flareAlong = dot(flareOffset, flareAxis);
  float flareAcross = dot(flareOffset, flareNormal);
  float flareCore = exp(-pow(length(flareOffset) / mix(0.075, 0.125, flareShape), 2.0));
  float flareStreak = exp(-pow(abs(flareAcross) / mix(0.024, 0.011, flareShape), 1.22))
    * exp(-pow(abs(flareAlong) / mix(0.22, 0.42, flareShape), 0.82));
  float flareNeedle = exp(-pow(abs(flareAcross) / mix(0.016, 0.006, flareShape), 1.06))
    * exp(-pow(abs(flareAlong) / mix(0.34, 0.62, flareShape), 0.74));
  vec2 flareGhostCenter = flareCenter - flareAxis * mix(0.12, 0.26, flareShape);
  float flareGhost = exp(
    -pow(length(uv - flareGhostCenter) / mix(0.095, 0.19, flareShape), 2.0)
  ) * smoothstep(0.44, 0.9, flareShape);
  vec2 flareGhostCenter2 = flareCenter + flareAxis * mix(0.18, 0.34, flareShape);
  float flareGhost2 = exp(
    -pow(length(uv - flareGhostCenter2) / mix(0.05, 0.1, flareShape), 1.9)
  ) * smoothstep(0.66, 1.0, flareShape);
  float flareCanvasDist = length(uv);
  float flareMask = (1.0 - smoothstep(0.76, 1.02, flareCanvasDist))
    * smoothstep(0.05, 0.28, cosTheta);
  vec3 flareColor = mix(vec3(1.0), clamp(gemBodyColor + vec3(0.18), 0.0, 1.2), 0.14 + 0.08 * rarityTier);
  rawColor += flareColor
    * flareCore
    * flarePresence
    * flareMask
    * mix(0.18, 0.54, flareShape);
  rawColor += mix(vec3(1.0), flareColor, 0.35)
    * flareStreak
    * flarePresence
    * flareMask
    * mix(0.10, 0.29, flareShape);
  rawColor += vec3(1.0)
    * flareNeedle
    * flarePresence
    * flareMask
    * mix(0.06, 0.22, flareShape);
  if (uRarity >= 3) {
    rawColor += mix(vec3(1.0), flareColor, 0.22)
      * flareGhost
      * flarePresence
      * flareMask
      * mix(0.10, 0.19, float(uRarity == 4));
    rawColor += vec3(1.0)
      * flareGhost2
      * flarePresence
      * flareMask
      * mix(0.07, 0.14, float(uRarity == 4));
  }

  // Epic/Legendary: star sapphire-style asterism (6-pointed star overlay)
  if (uRarity >= 3) {
    float starBright = 0.0;
    float ang = atan(uv.y, uv.x);
    float dist = length(uv);
    float legendaryBoost = float(uRarity == 4);
    float lightFront1 = smoothstep(0.18, 0.92, l1.z);
    float lightFront2 = smoothstep(0.12, 0.86, l2.z);
    float lightFront3 = smoothstep(0.08, 0.82, l3.z);
    vec2 asterismLightAxis = l1.xy * (0.75 + 0.25 * lightFront1)
      + l2.xy * (0.28 + 0.18 * lightFront2)
      + l3.xy * (0.12 + 0.1 * lightFront3);
    asterismLightAxis /= max(length(asterismLightAxis), 0.0001);
    float starCause = clamp(
      lightFront1 * 0.72 + lightFront2 * 0.26 + lightFront3 * 0.12,
      0.0,
      1.0
    );
    float starPresence = mix(0.2, 0.3, legendaryBoost);
    float starRotation = (l1.x * 0.018 + l1.y * 0.012) * (0.7 + 0.3 * starCause);
    for (int si = 0; si < 3; si++) {
      float starAng = float(si) * PI / 3.0 + uSeed * 0.3 + starRotation;
      vec2 starDir = vec2(cos(starAng), sin(starAng));
      float axisAlign = pow(abs(dot(starDir, asterismLightAxis)), 6.0 + legendaryBoost);
      float axisEnergy = smoothstep(0.16, 0.8, axisAlign) * mix(starPresence, 1.0, starCause);
      float lineThickness = mix(0.0045, 0.012, axisEnergy);
      float lineReach = mix(0.18, 0.58 + legendaryBoost * 0.1, axisEnergy);
      float lineStrength = mix(0.12, 0.5 + legendaryBoost * 0.14, axisEnergy);
      float lineDist = abs(sin(ang - starAng)) * dist;
      float lineCore = smoothstep(lineThickness, lineThickness * 0.18, lineDist);
      float radialMask = 1.0 - smoothstep(lineReach * 0.42, lineReach, dist);
      float centerBoost = 1.0 - smoothstep(0.0, 0.1, dist);
      float starLine = lineCore * mix(centerBoost, radialMask, 0.88);
      starBright += starLine * lineStrength;
    }
    float starStrength = mix(0.82, 1.04, legendaryBoost);
    rawColor += vec3(starBright * starStrength * uGlowIntensity);
  }

  // Rare+: subtle outer glow
  float canvasDist = length(uv);
  float gemRimMask = smoothstep(0.22, 0.42, canvasDist)
    * smoothstep(0.92, 0.58, canvasDist);
  if (rarityGlow > 0.0) {
    float glow = gemRimMask * rarityGlow;
    float edgePresence = smoothstep(0.04, 0.22, edgeMask);
    rawColor += gemBodyColor
      * glow
      * mix(1.2, 1.9, edgePresence)
      * uGlowIntensity;
  }

  float outerCanvasFade = smoothstep(0.82, 1.08, canvasDist);
  rawColor *= 1.0 - outerCanvasFade * 0.18;

  /* ── 14. Tonemap ───────────────────────────────────────────────────────── */
  vec3 color = tonemap(rawColor);

  outColor = vec4(color, 1.0);
}
`;

export const FRAGMENT_SHADER: string =
  FRAGMENT_PREAMBLE + ALL_CUT_GLSL + FRAGMENT_DISPATCHER + FRAGMENT_MAIN;
