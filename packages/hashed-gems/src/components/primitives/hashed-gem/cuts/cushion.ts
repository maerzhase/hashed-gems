import type * as React from "react";

// ── CUSHION CUT ──────────────────────────────────────────────────────────────
// 8-fold symmetry with broad, chunky "pillow" facets.
// Uses superellipse radial metric (p=2.5) for the characteristic rounded-square
// outline. Fewer, wider zones create the soft pillow appearance.

export const CUSHION_GLSL = /* glsl */ `
CutResult computeCushion(vec2 uv, float seed) {
  CutResult res;
  res.normal  = vec3(0.0, 0.0, 1.0);
  res.facetId = 0;
  res.edgeMask = 0.0;

  float angle = atan(uv.y, uv.x);
  float p = seededSpan(seed, 50.0, 2.15, 3.10);
  float pillowBulge = seededSpan(seed, 51.0, 0.018, 0.050);
  float shoulderWave = 1.0
    + pillowBulge * cos(angle * 4.0 + seed * 0.53)
    + 0.012 * sin(angle * 8.0 + seed * 1.1);
  float cshR = clamp(
    pow(pow(abs(uv.x), p) + pow(abs(uv.y), p), 1.0/p) / (GEM_CANVAS_SCALE * shoulderWave),
    0.0,
    1.0
  );

  float sw = PI / 4.0;  // 8-fold
  float oa = mod(angle + sw*0.5, sw) - sw*0.5;
  float oi = floor((angle + sw*0.5) / sw);
  bool  upperHalf = oa > 0.0;
  float subOi     = oi * 2.0 + (upperHalf ? 1.0 : 0.0);

  float zj = 0.014 * sin(seed * 7.3 + oi * 1.4);
  float sectorScale = 0.94 + 0.11 * hash11(seed * 0.37 + oi * 0.79);
  float w0 = seededSpan(seed, 52.0, 0.16, 0.22) * sectorScale;
  float w1 = seededSpan(seed, 53.0, 0.12, 0.20) * (0.96 + 0.08 * hash11(seed * 0.41 + subOi * 0.51));
  float w2 = seededSpan(seed, 54.0, 0.12, 0.18) * (0.95 + 0.08 * hash11(seed * 0.49 + subOi * 0.67));
  float w3 = seededSpan(seed, 55.0, 0.11, 0.16);
  float w4 = seededSpan(seed, 56.0, 0.08, 0.13);
  float z0 = w0 + zj;
  float z1 = z0 + w1;
  float z2 = z1 + w2;
  float z3 = z2 + w3;
  float z4 = min(GEM_CANVAS_SCALE, z3 + w4);
  float outerScale = GEM_FILL_TARGET / max(z4, 0.001);
  z0 *= outerScale;
  z1 *= outerScale;
  z2 *= outerScale;
  z3 *= outerScale;
  z4 *= outerScale;

  if (cshR < z0) {
    // Subdivide table into 8 sectors matching the cushion's 8-fold symmetry.
    float tAng  = atan(uv.y, uv.x);
    float tSw   = PI / 4.0;  // 8 sectors
    float tOa   = mod(tAng + tSw*0.5, tSw) - tSw*0.5;
    float tOi   = floor((tAng + tSw*0.5) / tSw);
    float tA    = tOi * tSw + tSw*0.5;
    float tilt  = 0.034 + 0.013*cos(seed*2.1 + tOi*0.8);
    float tableDa = tSw*0.5 - abs(tOa);
    float tableEdge = 1.0 - smoothstep(0.0, 0.020, tableDa);
    float tableFade = smoothstep(0.018, z0, cshR);
    res.normal  = normalize(vec3(cos(tA)*tilt, sin(tA)*tilt, 1.0-tilt));
    res.facetId = 200 + int(tOi);
    res.edgeMask = tableEdge * tableFade * 0.42;
  } else if (cshR < z1) {
    float outA = oi*sw + sw*0.5;
    float tilt = 0.20 + 0.08*sin(seed*1.7 + subOi*0.9);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 1 + int(subOi);
  } else if (cshR < z2) {
    float outA = oi*sw + (upperHalf ? sw*0.7 : sw*0.3);
    float tilt = 0.38 + 0.10*cos(seed*2.3 + subOi*0.7);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 17 + int(subOi);
  } else if (cshR < z3) {
    float outA = oi*sw + (upperHalf ? sw*0.75 : sw*0.25);
    float tilt = 0.52 + 0.08*sin(seed*3.1 + subOi*0.8);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 33 + int(subOi);
  } else if (cshR < z4) {
    float outA = oi*sw + sw*0.5;
    float tilt = 0.65 + 0.06*sin(seed*2.7 + oi*0.9);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 49 + int(oi);
  } else {
    float outA = oi*sw + sw*0.5;
    float tilt = 0.75 + 0.04*sin(seed*1.9 + oi*1.1);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 57 + int(oi);
  }

  float dr = min(min(min(abs(cshR-z0), abs(cshR-z1)), abs(cshR-z2)),
                 min(abs(cshR-z3), abs(cshR-z4)));
  float da = min(sw*0.5 - abs(oa), abs(oa));
  res.edgeMask = max(1.0 - smoothstep(0.0, 0.014, min(da * 0.7, dr)), 0.0);
  return res;
}
`;

export const CUSHION_BORDER_RADIUS = "30%";

export function cushionCssGradient(
  seed: number,
  borderRadius: string,
): React.CSSProperties {
  const rotOffset = seed % 360;
  const fromAngle = 22.5 + (rotOffset % 45);
  const centerX = 50 + Math.sin(seed * 0.017) * 3;
  const centerY = 50 + Math.cos(seed * 0.021) * 3;
  const stops = Array.from({ length: 4 }, (_, i) => {
    const s = i * 90;
    const mid = s + 22.5;
    const e = s + 45;
    return `transparent ${s}deg, rgba(255,255,255,0.07) ${mid}deg, transparent ${e}deg`;
  }).join(", ");
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      radial-gradient(circle at ${centerX}% ${centerY}%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 20%, transparent 36%),
      conic-gradient(from ${fromAngle}deg at ${centerX}% ${centerY}%, ${stops}, transparent 360deg)
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
