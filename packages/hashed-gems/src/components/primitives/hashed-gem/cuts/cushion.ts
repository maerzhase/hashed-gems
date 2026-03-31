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

  float p    = 2.5;
  float cshR = pow(pow(abs(uv.x), p) + pow(abs(uv.y), p), 1.0/p) / 0.90;
  float angle = atan(uv.y, uv.x);

  float sw = PI / 4.0;  // 8-fold
  float oa = mod(angle + sw*0.5, sw) - sw*0.5;
  float oi = floor((angle + sw*0.5) / sw);

  float zj = 0.025 * sin(seed * 7.3 + oi * 1.4);
  float z0=0.18+zj, z1=0.38+zj, z2=0.56+zj, z3=0.72+zj*0.7, z4=0.85+zj*0.4;

  bool  upperHalf = oa > 0.0;
  float subOi     = oi * 2.0 + (upperHalf ? 1.0 : 0.0);

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
  const stops = Array.from({ length: 4 }, (_, i) => {
    const s = i * 90;
    const mid = s + 22.5;
    const e = s + 45;
    return `transparent ${s}deg, rgba(255,255,255,0.09) ${mid}deg, transparent ${e}deg`;
  }).join(", ");
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `conic-gradient(from ${fromAngle}deg at 50% 50%, ${stops}, transparent 360deg)`,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
