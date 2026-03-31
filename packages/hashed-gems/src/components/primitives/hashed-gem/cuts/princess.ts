import type * as React from "react";

// ── PRINCESS CUT ─────────────────────────────────────────────────────────────
// 4-fold square symmetry with chevron/V patterns pointing to corners.
// Distinctive diagonal kite facets radiating from center to each corner,
// separated by side facets pointing toward edges.

export const PRINCESS_GLSL = /* glsl */ `
CutResult computePrincess(vec2 uv, float seed) {
  CutResult res;
  res.normal  = vec3(0.0, 0.0, 1.0);
  res.facetId = 0;
  res.edgeMask = 0.0;

  float ax = abs(uv.x), ay = abs(uv.y);
  float chevAng = atan(ay, ax);          // 0 to PI/2 within each quadrant
  float angle   = atan(uv.y, uv.x);
  float quadrant = floor(angle / (PI * 0.5) + 0.5);
  float cornerPressure = seededSpan(seed, 30.0, 0.02, 0.08);
  float shoulderLift = seededSpan(seed, 31.0, 0.01, 0.05);
  float sqMetric = max(ax, ay) + min(ax, ay) * cornerPressure;
  float sqR = sqMetric / (0.89 + shoulderLift * cos((quadrant + 0.5) * 1.7 + seed * 0.37));
  float diagWidth = seededSpan(seed, 32.0, 0.12, 0.20);
  float quadrantDiag = diagWidth + 0.03 * hash11(seed * 0.63 + quadrant * 0.71);
  float chevOa  = abs(chevAng - PI * 0.25); // distance from 45° diagonal

  float zj = 0.012 * sin(seed * 5.7 + quadrant * 1.4);
  float quadrantScale = 0.95 + 0.10 * hash11(seed * 0.41 + quadrant * 0.83);
  float w0 = seededSpan(seed, 33.0, 0.09, 0.13) * quadrantScale;
  float w1 = seededSpan(seed, 34.0, 0.10, 0.13) * quadrantScale;
  float w2 = seededSpan(seed, 35.0, 0.10, 0.14) * (0.96 + 0.08 * hash11(seed * 0.53 + quadrant * 0.61));
  float w3 = seededSpan(seed, 36.0, 0.10, 0.14);
  float w4 = seededSpan(seed, 37.0, 0.09, 0.13);
  float w5 = seededSpan(seed, 38.0, 0.08, 0.12);
  float w6 = seededSpan(seed, 39.0, 0.08, 0.11);
  float z0 = w0 + zj;
  float z1 = z0 + w1;
  float z2 = z1 + w2;
  float z3 = z2 + w3;
  float z4 = z3 + w4;
  float z5 = z4 + w5;
  float z6 = min(0.90, z5 + w6);

  bool  nearDiag  = chevOa < quadrantDiag;
  float chevSide  = chevAng > PI*0.25 ? 1.0 : -1.0;
  float sideCompression = seededSpan(seed, 40.0, 0.10, 0.28);

  float outA = quadrant * PI * 0.5 + PI * 0.25; // toward corner
  float sideA = quadrant * PI * 0.5;             // toward edge

  if (sqR < z0) {
    // Subdivide table into 4 diagonal sectors matching the princess cut chevrons.
    float tAng  = atan(uv.y, uv.x);
    float tSw   = PI / 2.0;  // 4 sectors
    float tOa   = mod(tAng + tSw*0.5, tSw) - tSw*0.5;
    float tOi   = floor((tAng + tSw*0.5) / tSw);
    float tA    = tOi * tSw + PI * 0.25; // point toward corners
    float tilt  = 0.034 + 0.014*sin(seed*1.9 + tOi*1.1);
    float tableDa = tSw*0.5 - abs(tOa);
    float tableEdge = 1.0 - smoothstep(0.0, 0.028, tableDa);
    float tableFade = smoothstep(0.015, z0, sqR);
    res.normal  = normalize(vec3(cos(tA)*tilt, sin(tA)*tilt, 1.0-tilt));
    res.facetId = 200 + int(tOi);
    res.edgeMask = tableEdge * tableFade * 0.40;
  } else {
    float tilt;
    float a;
    if (sqR < z1) {
      tilt = 0.15 + 0.05*sin(seed*1.7);
      res.facetId = nearDiag ? 10 : 11;
      a = nearDiag ? outA : sideA + chevSide * (sideCompression + 0.05);
    } else if (sqR < z2) {
      tilt = 0.25 + 0.06*sin(seed*2.3);
      res.facetId = nearDiag ? 20 : 21;
      a = nearDiag ? outA + 0.04 * sin(seed + quadrant) : sideA + chevSide * sideCompression;
    } else if (sqR < z3) {
      tilt = 0.35 + 0.06*sin(seed*3.1);
      res.facetId = nearDiag ? 30 : (chevSide > 0.0 ? 31 : 32);
      a = nearDiag ? outA + 0.05 * cos(seed * 1.3 + quadrant) : sideA + chevSide * max(0.08, sideCompression - 0.04);
    } else if (sqR < z4) {
      tilt = 0.45 + 0.05*sin(seed*2.7);
      res.facetId = nearDiag ? 40 : (chevSide > 0.0 ? 41 : 42);
      a = nearDiag ? outA + 0.1*sin(seed + quadrant * 0.7) : sideA + chevSide * max(0.06, sideCompression - 0.08);
    } else if (sqR < z5) {
      tilt = 0.55 + 0.05*sin(seed*1.9);
      res.facetId = nearDiag ? 50 : (chevSide > 0.0 ? 51 : 52);
      a = nearDiag ? outA : sideA + chevSide * max(0.05, sideCompression - 0.12);
    } else if (sqR < z6) {
      tilt = 0.65 + 0.04*sin(seed*2.1);
      res.facetId = nearDiag ? 55 : (chevSide > 0.0 ? 56 : 57);
      a = nearDiag ? outA : sideA + chevSide * max(0.04, sideCompression - 0.15);
    } else {
      tilt = 0.72 + 0.03*sin(seed*1.5);
      res.facetId = 60;
      a = nearDiag ? outA : sideA;
    }
    res.normal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
  }

  float drP = min(min(min(abs(sqR-z0), abs(sqR-z1)), min(abs(sqR-z2), abs(sqR-z3))),
                  min(min(abs(sqR-z4), abs(sqR-z5)), abs(sqR-z6)));
  float diagEdge = abs(chevOa - quadrantDiag);
  res.edgeMask = max(1.0 - smoothstep(0.0, 0.012, drP),
                     (1.0 - smoothstep(0.0, 0.015, diagEdge)) * 0.7);
  return res;
}
`;

export const PRINCESS_BORDER_RADIUS = "3px";

export function princessCssGradient(
  seed: number,
  borderRadius: string,
): React.CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      linear-gradient(${45 + (seed % 18)}deg, transparent 28%, rgba(255,255,255,0.08) 50%, transparent 72%),
      linear-gradient(${135 + (seed % 12)}deg, transparent 32%, rgba(255,255,255,0.05) 50%, transparent 68%)
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
