import type * as React from "react";

// ── ROUND BRILLIANT CUT ───────────────────────────────────────────────────────
// 16-fold radial symmetry with circular radial zones (length(uv) — not square).
// Layers: table → star facets → upper bezel → main kites →
//         upper girdle A/B → lower girdle → girdle edge.

export const ROUND_BRILLIANT_GLSL = /* glsl */ `
CutResult computeRoundBrilliant(vec2 uv, float seed) {
  CutResult res;
  res.normal  = vec3(0.0, 0.0, 1.0);
  res.facetId = 0;
  res.edgeMask = 0.0;

  float angle  = atan(uv.y, uv.x);
  float tableRatio = seededSpan(seed, 20.0, 0.10, 0.14);
  float starReach = seededSpan(seed, 21.0, 0.09, 0.13);
  float bezelSpan = seededSpan(seed, 22.0, 0.10, 0.14);
  float mainSpan = seededSpan(seed, 23.0, 0.10, 0.13);
  float upperGirdleSpan = seededSpan(seed, 24.0, 0.08, 0.12);
  float lowerGirdleSpan = seededSpan(seed, 25.0, 0.07, 0.11);
  float girdleSpan = seededSpan(seed, 26.0, 0.07, 0.10);
  float lobeStrength = seededSpan(seed, 27.0, 0.010, 0.032);
  float ringWarp = 1.0
    + lobeStrength * cos(angle * 8.0 + seed * 0.63)
    + 0.012 * sin(angle * 16.0 + seed * 1.1);
  float radius = clamp(length(uv) / (GEM_CANVAS_SCALE * ringWarp), 0.0, 1.0);

  float sw  = PI / 8.0;  // 16-fold
  float oa  = mod(angle + sw*0.5, sw) - sw*0.5;
  float oi  = floor((angle + sw*0.5) / sw);
  float tu  = (oa + sw*0.5) / sw;

  float twist = 0.50 + 0.25 * fract(seed * 0.017);
  float sang  = angle + radius * twist;
  float sw2   = TWO_PI / 32.0;
  float oa2   = mod(sang + sw2*0.5, sw2) - sw2*0.5;
  float oi2f  = floor((sang + sw2*0.5) / sw2);

  float zj = 0.012 * sin(seed * 7.3 + oi * 1.4);
  float sectorScale = 0.95 + 0.10 * hash11(seed * 0.47 + oi * 0.73);
  float subScale = 0.96 + 0.08 * hash11(seed * 0.63 + oi2f * 0.31);
  float z1 = tableRatio * sectorScale + zj;
  float z2 = z1 + starReach * mix(sectorScale, subScale, 0.45);
  float z3 = z2 + bezelSpan * mix(1.0, subScale, 0.55);
  float z4 = z3 + mainSpan * mix(sectorScale, subScale, 0.50);
  float z5 = z4 + upperGirdleSpan * mix(1.0, sectorScale, 0.35);
  float z6 = z5 + lowerGirdleSpan * mix(1.0, subScale, 0.30);
  float z7 = min(GEM_CANVAS_SCALE, z6 + girdleSpan);
  float outerScale = GEM_FILL_TARGET / max(z7, 0.001);
  z1 *= outerScale;
  z2 *= outerScale;
  z3 *= outerScale;
  z4 *= outerScale;
  z5 *= outerScale;
  z6 *= outerScale;
  z7 *= outerScale;

  if (radius < z1) {
    // Subdivide table into 8 sectors matching the cut's symmetry.
    // Give the table a subtle structural read so the center doesn't flatten into one block.
    float tSw = PI / 4.0;  // 8 sectors
    float tAng = atan(uv.y, uv.x);
    float tOa  = mod(tAng + tSw*0.5, tSw) - tSw*0.5;
    float tOi  = floor((tAng + tSw*0.5) / tSw);
    float tA   = tOi * tSw + tSw*0.5;
    float tilt = 0.036 + 0.014*sin(seed*1.3 + tOi*0.9);
    float tableDa = tSw*0.5 - abs(tOa);
    float tableEdge = 1.0 - smoothstep(0.0, 0.018, tableDa);
    float tableFade = smoothstep(0.015, z1, radius);
    res.normal  = normalize(vec3(cos(tA)*tilt, sin(tA)*tilt, 1.0-tilt));
    res.facetId = 200 + int(tOi);
    res.edgeMask = tableEdge * tableFade * 0.45;
  } else if (radius < z2) {
    float outA = oi*sw + sw*0.5 + 0.04 * sin(seed * 1.6 + oi * 0.7);
    float tilt = 0.18 + 0.06*sin(seed*1.7+oi*0.78) + 0.03*sin(oi2f*2.1+seed*3.3);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 1 + int(oi);
  } else if (radius < z3) {
    float outA = oi*sw + sw*0.5 + 0.05 * cos(seed * 1.9 + oi * 0.6);
    float subA = 0.06 * cos(oi2f*1.9 + seed*1.4);
    float tilt = 0.30 + 0.08*cos(seed*2.3+oi*0.79) + 0.04*sin(oi2f*1.5+seed);
    res.normal  = normalize(vec3(cos(outA+subA)*tilt, sin(outA+subA)*tilt, 1.0-tilt));
    res.facetId = 17 + int(oi) + (int(oi2f) % 2) * 16;
  } else if (radius < z4) {
    float sOff = tu < 0.5 ? sw*0.25 : sw*0.75;
    float outA = oi*sw + sOff;
    float tilt = 0.42 + 0.08*sin(seed*3.1+oi*0.81);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 49 + int(oi) + (tu < 0.5 ? 0 : 16);
  } else if (radius < z5) {
    float sOff = tu < 0.5 ? sw*0.20 : sw*0.80;
    float outA = oi*sw + sOff;
    float subA = 0.05 * sin(oi2f*1.7 + seed*2.8);
    float tilt = 0.55 + 0.07*sin(seed*2.7+oi*0.93);
    res.normal  = normalize(vec3(cos(outA+subA)*tilt, sin(outA+subA)*tilt, 1.0-tilt));
    res.facetId = 81 + int(oi) + (tu < 0.5 ? 0 : 16);
  } else if (radius < z6) {
    float outA = oi*sw + sw*0.5;
    float tilt = 0.65 + 0.05*sin(seed*1.9+oi*1.1);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 113 + int(oi);
  } else if (radius < z7) {
    float sOff = tu < 0.5 ? sw*0.30 : sw*0.70;
    float outA = oi*sw + sOff;
    float tilt = 0.73 + 0.04*sin(seed*2.1+oi*0.87);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 129 + int(oi) + (tu < 0.5 ? 0 : 16);
  } else {
    float outA = oi*sw + sw*0.5;
    float tilt = 0.80 + 0.03*sin(seed*1.5+oi*0.73);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 161 + int(oi);
  }

  float dr  = min(min(min(abs(radius-z1), abs(radius-z2)), min(abs(radius-z3), abs(radius-z4))),
                  min(min(abs(radius-z5), abs(radius-z6)), abs(radius-z7)));
  float da  = min(sw*0.5 - abs(oa), abs(oa));
  float da2 = sw2*0.5 - abs(oa2);
  res.edgeMask = max(1.0 - smoothstep(0.0, 0.010, min(da, dr)),
                     (1.0 - smoothstep(0.0, 0.005, da2)) * 0.5);
  return res;
}
`;

export const ROUND_BRILLIANT_BORDER_RADIUS = "50%";

export function roundBrilliantCssGradient(
  seed: number,
  borderRadius: string,
): React.CSSProperties {
  const rotOffset = seed % 360;
  const fromAngle = rotOffset % 22.5;
  const centerX = 48 + Math.sin(seed * 0.019) * 4;
  const centerY = 50 + Math.cos(seed * 0.023) * 4;
  const stops = Array.from({ length: 8 }, (_, i) => {
    const s = i * 45;
    const mid = s + 11.25;
    const e = s + 22.5;
    return `transparent ${s}deg, rgba(255,255,255,0.08) ${mid}deg, transparent ${e}deg`;
  }).join(", ");
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      radial-gradient(circle at ${centerX}% ${centerY}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 14%, transparent 28%),
      conic-gradient(from ${fromAngle}deg at ${centerX}% ${centerY}%, ${stops}, transparent 360deg)
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
