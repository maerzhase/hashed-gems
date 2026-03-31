import type * as React from "react";

// ── EMERALD STEP CUT ──────────────────────────────────────────────────────────
// Rectangular/octagonal outline with concentric step bands.
// Each band is subdivided into 4 side facets (top/bottom/left/right) and
// 4 corner facets (45° normals). No smooth blending — hard facet boundaries
// create the characteristic mirror-like "hall of mirrors" effect.
//
// Real emerald cut anatomy:
//   - Central rectangular table
//   - Concentric rectangular step bands (crown facets)
//   - Chamfered/clipped corners — separate distinct corner facets
//   - Bands get progressively steeper toward the girdle

export const EMERALD_STEP_GLSL = /* glsl */ `
CutResult computeEmeraldStep(vec2 uv, float seed) {
  CutResult res;
  res.normal  = vec3(0.0, 0.0, 1.0);
  res.facetId = 0;
  res.edgeMask = 0.0;

  // Aspect ratio: slightly wider than tall (typical emerald cut ~1.4:1)
  float asp  = seededSpan(seed, 60.0, 1.22, 1.44);
  vec2  aUv  = abs(uv);
  // Normalized so lInf == 1.0 at the gem edge
  vec2  sUv  = aUv / vec2(0.90 * asp, 0.90);
  float lInf = max(sUv.x, sUv.y);

  // Octagonal clipping: corners are cut at 45°
  // A point is in a "corner zone" when its distance to the nearest diagonal
  // is small relative to its distance from centre.
  // We use a fixed corner-cut ratio: when both |x| and |y| exceed cornerCut
  // of the band's outer edge, it is a corner facet.
  float cornerCutBase = seededSpan(seed, 61.0, 0.28, 0.42);

  // Determine which of the 4 side faces this pixel belongs to
  // (purely by which coordinate dominates — no blending)
  float faceBias = seededSpan(seed, 62.0, -0.035, 0.035);
  bool  isXFace = (sUv.x + faceBias >= sUv.y);       // left or right face
  float fDirX   = sign(uv.x);
  float fDirY   = sign(uv.y);

  // Corner detection: both axes close to equal (within cornerCut of the diagonal)
  // diagRatio: 0 = on the diagonal (corner), 1 = fully on a flat face
  float minAxis = min(sUv.x, sUv.y);
  float maxAxis = max(sUv.x, sUv.y);
  float diagRatio = (maxAxis < 0.001) ? 1.0 : (maxAxis - minAxis) / maxAxis;
  bool  isCorner  = false;

  // Step band boundaries (Chebyshev / L-inf from centre)
  float w0 = seededSpan(seed, 63.0, 0.10, 0.15);
  float w1 = seededSpan(seed, 64.0, 0.10, 0.14);
  float w2 = seededSpan(seed, 65.0, 0.10, 0.14);
  float w3 = seededSpan(seed, 66.0, 0.09, 0.13);
  float w4 = seededSpan(seed, 67.0, 0.09, 0.13);
  float w5 = seededSpan(seed, 68.0, 0.08, 0.12);
  float w6 = seededSpan(seed, 69.0, 0.07, 0.10);
  float w7 = seededSpan(seed, 70.0, 0.06, 0.09);
  float sb0 = w0;
  float sb1 = sb0 + w1;
  float sb2 = sb1 + w2;
  float sb3 = sb2 + w3;
  float sb4 = sb3 + w4;
  float sb5 = sb4 + w5;
  float sb6 = sb5 + w6;
  float sb7 = min(0.90, sb6 + w7);

  float tilt = 0.0;
  float cornerCut = cornerCutBase;

  // Band index drives both tilt and base facetId.
  // Side facets: facetId = bandBase + side (0=right, 1=top, 2=left, 3=bottom)
  // Corner facets: facetId = bandBase + 4 + corner (0=TR, 1=TL, 2=BL, 3=BR)
  int bandBase = 0;

  if (lInf < sb0) {
    // Subdivide table into 4 face-aligned sectors (top/bottom/left/right)
    // matching the rectangular step geometry — creates a cross in the center.
    bool  tIsX  = (sUv.x >= sUv.y);  // left/right face
    float tFX   = sign(uv.x);
    float tFY   = sign(uv.y);
    float tilt  = 0.036 + 0.010*sin(seed*1.7);
    float tableEdge = 1.0 - smoothstep(0.0, 0.045, abs(sUv.x - sUv.y));
    float tableFade = smoothstep(0.018, sb0, lInf);
    if (tIsX) {
      res.normal  = normalize(vec3(tFX * tilt, 0.0, 1.0 - tilt));
      res.facetId = tFX > 0.0 ? 200 : 202;
    } else {
      res.normal  = normalize(vec3(0.0, tFY * tilt, 1.0 - tilt));
      res.facetId = tFY > 0.0 ? 201 : 203;
    }
    res.edgeMask = tableEdge * tableFade * 0.42;
  } else {
    if      (lInf < sb1) { tilt = 0.11 + 0.03*sin(seed*1.7); bandBase = 10; }
    else if (lInf < sb2) { tilt = 0.22 + 0.03*sin(seed*2.3); bandBase = 20; }
    else if (lInf < sb3) { tilt = 0.33 + 0.04*sin(seed*3.1); bandBase = 30; }
    else if (lInf < sb4) { tilt = 0.44 + 0.04*sin(seed*2.7); bandBase = 40; }
    else if (lInf < sb5) { tilt = 0.54 + 0.03*sin(seed*1.9); bandBase = 50; }
    else if (lInf < sb6) { tilt = 0.64 + 0.03*sin(seed*2.1); bandBase = 56; }
    else if (lInf < sb7) { tilt = 0.74 + 0.03*sin(seed*1.5); bandBase = 62; }
    else                 { tilt = 0.83;                        bandBase = 68; }

    cornerCut = cornerCutBase
      + smoothstep(sb2, sb6, lInf) * seededSpan(seed, 71.0, -0.06, 0.04);
    isCorner = diagRatio < cornerCut;

    if (isCorner) {
      // Corner facet: normal points 45° toward the corner
      int cornerIdx = (fDirX > 0.0 ? 0 : 2) + (fDirY > 0.0 ? 0 : 1);
      // TR=0, TL=2, BL=3, BR=1 — use 45° diagonal normal
      float cx = fDirX * tilt * 0.7071;
      float cy = fDirY * tilt * 0.7071;
      res.normal  = normalize(vec3(cx, cy, 1.0 - tilt));
      res.facetId = bandBase + 4 + cornerIdx;
    } else if (isXFace) {
      // Left or right face — normal tilts along X
      res.normal  = normalize(vec3(fDirX * tilt, 0.0, 1.0 - tilt));
      res.facetId = bandBase + (fDirX > 0.0 ? 0 : 2);
    } else {
      // Top or bottom face — normal tilts along Y
      res.normal  = normalize(vec3(0.0, fDirY * tilt, 1.0 - tilt));
      res.facetId = bandBase + (fDirY > 0.0 ? 1 : 3);
    }
  }

  // Edge mask: step band boundaries + hard facet type boundaries
  float drStp = min(min(min(abs(lInf-sb0), abs(lInf-sb1)), min(abs(lInf-sb2), abs(lInf-sb3))),
                    min(min(abs(lInf-sb4), abs(lInf-sb5)), min(abs(lInf-sb6), abs(lInf-sb7))));

  // Facet type boundary — the corner/side transition edge
  float diagEdge = abs(diagRatio - cornerCut);

  res.edgeMask = max(1.0 - smoothstep(0.0, 0.011, drStp),
                     (1.0 - smoothstep(0.0, 0.025, diagEdge)) * 0.7);
  return res;
}
`;

export const EMERALD_STEP_BORDER_RADIUS = "6px";

export function emeraldStepCssGradient(
  seed: number,
  borderRadius: string,
): React.CSSProperties {
  const insetA = 12 + (seed % 5);
  const insetB = 18 + (seed % 7);
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      linear-gradient(to bottom,
        rgba(255,255,255,0.06) 0%, transparent ${insetA}%,
        rgba(255,255,255,0.04) ${insetB}%, transparent 34%,
        rgba(255,255,255,0.03) 42%, transparent 52%,
        transparent 60%, rgba(255,255,255,0.03) 68%,
        transparent 78%, rgba(255,255,255,0.04) 86%,
        transparent 94%, rgba(255,255,255,0.06) 100%
      ),
      linear-gradient(to right,
        rgba(255,255,255,0.06) 0%, transparent ${insetA}%,
        rgba(255,255,255,0.04) ${insetB}%, transparent 34%,
        rgba(255,255,255,0.03) 42%, transparent 52%,
        transparent 60%, rgba(255,255,255,0.03) 68%,
        transparent 78%, rgba(255,255,255,0.04) 86%,
        transparent 94%, rgba(255,255,255,0.06) 100%
      )
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
