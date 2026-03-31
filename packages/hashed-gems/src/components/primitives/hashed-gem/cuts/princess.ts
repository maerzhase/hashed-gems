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
  float sqR = max(ax, ay) / 0.90;

  float chevAng = atan(ay, ax);          // 0 to PI/2 within each quadrant
  float chevOa  = abs(chevAng - PI * 0.25); // distance from 45° diagonal
  float angle   = atan(uv.y, uv.x);
  float quadrant = floor(angle / (PI * 0.5) + 0.5);

  float zj = 0.02 * sin(seed * 5.7 + quadrant * 1.4);
  float z0=0.10+zj, z1=0.22+zj, z2=0.34+zj, z3=0.46+zj,
        z4=0.58+zj, z5=0.70+zj, z6=0.82+zj;

  // Tighter diagonal threshold → crisper corner kite facets
  bool  nearDiag  = chevOa < 0.18;
  float chevSide  = chevAng > PI*0.25 ? 1.0 : -1.0;

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
      a = nearDiag ? outA : sideA + chevSide * 0.3;
    } else if (sqR < z2) {
      tilt = 0.25 + 0.06*sin(seed*2.3);
      res.facetId = nearDiag ? 20 : 21;
      a = nearDiag ? outA : sideA + chevSide * 0.25;
    } else if (sqR < z3) {
      tilt = 0.35 + 0.06*sin(seed*3.1);
      res.facetId = nearDiag ? 30 : (chevSide > 0.0 ? 31 : 32);
      a = nearDiag ? outA : sideA + chevSide * 0.2;
    } else if (sqR < z4) {
      tilt = 0.45 + 0.05*sin(seed*2.7);
      res.facetId = nearDiag ? 40 : (chevSide > 0.0 ? 41 : 42);
      a = nearDiag ? outA + 0.1*sin(seed) : sideA + chevSide * 0.15;
    } else if (sqR < z5) {
      tilt = 0.55 + 0.05*sin(seed*1.9);
      res.facetId = nearDiag ? 50 : (chevSide > 0.0 ? 51 : 52);
      a = nearDiag ? outA : sideA + chevSide * 0.12;
    } else if (sqR < z6) {
      tilt = 0.65 + 0.04*sin(seed*2.1);
      res.facetId = nearDiag ? 55 : (chevSide > 0.0 ? 56 : 57);
      a = nearDiag ? outA : sideA + chevSide * 0.10;
    } else {
      tilt = 0.72 + 0.03*sin(seed*1.5);
      res.facetId = 60;
      a = nearDiag ? outA : sideA;
    }
    res.normal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
  }

  float drP = min(min(min(abs(sqR-z0), abs(sqR-z1)), min(abs(sqR-z2), abs(sqR-z3))),
                  min(min(abs(sqR-z4), abs(sqR-z5)), abs(sqR-z6)));
  float diagEdge = abs(chevOa - 0.18);
  res.edgeMask = max(1.0 - smoothstep(0.0, 0.012, drP),
                     (1.0 - smoothstep(0.0, 0.015, diagEdge)) * 0.7);
  return res;
}
`;

export const PRINCESS_BORDER_RADIUS = "3px";

export function princessCssGradient(
  _seed: number,
  borderRadius: string,
): React.CSSProperties {
  // CSS can't replicate WebGL's smooth angular facets without harsh artifacts
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    pointerEvents: "none",
  };
}
