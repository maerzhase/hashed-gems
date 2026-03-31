import type * as React from "react";

// ── JUBILEE CUT ───────────────────────────────────────────────────────────────
// Historical Jubilee is better thought of as an antique, tableless round:
// a pointed central apex, chunky bezel/star/cross facet structure, and a
// domed crown rather than the flatter, ring-led read of a round brilliant.

export const JUBILEE_GLSL = /* glsl */ `
CutResult computeJubilee(vec2 uv, float seed) {
  CutResult res;
  res.normal  = vec3(0.0, 0.0, 1.0);
  res.facetId = 0;
  res.edgeMask = 0.0;

  float radius = length(uv) / 0.90;
  float angle  = atan(uv.y, uv.x);

  float bezelSw = PI / 4.0;    // 8 primary bezel sectors
  float bezelOa = mod(angle + bezelSw*0.5, bezelSw) - bezelSw*0.5;
  float bezelOi = floor((angle + bezelSw*0.5) / bezelSw);
  float bezelTu = (bezelOa + bezelSw*0.5) / bezelSw;

  float starSw = PI / 8.0;     // 16 star/cross sectors
  float starOa = mod(angle + starSw*0.5, starSw) - starSw*0.5;
  float starOi = floor((angle + starSw*0.5) / starSw);
  float starTu = (starOa + starSw*0.5) / starSw;

  float antiqueTwist = 0.035 * sin(seed * 1.4 + starOi * 0.7);
  float crownRise = 0.5 + 0.5 * cos(angle * 8.0 + seed * 0.31);
  float zj = 0.014 * sin(seed * 5.1 + bezelOi * 1.2)
           + 0.008 * cos(seed * 2.4 + starOi * 0.9);
  float z0=0.055+zj*0.25, z1=0.16+zj*0.45, z2=0.33+zj*0.65,
        z3=0.53+zj*0.45, z4=0.72+zj*0.25, z5=0.87;

  if (radius < z0) {
    float split = bezelTu < 0.5 ? -1.0 : 1.0;
    float apexA = bezelOi * bezelSw + bezelSw * 0.5 + split * bezelSw * 0.18;
    float tilt = 0.095 + 0.022 * sin(seed * 1.9 + bezelOi * 0.8);
    float apexDa = bezelSw*0.5 - abs(bezelOa);
    float apexEdge = 1.0 - smoothstep(0.0, 0.016, apexDa);
    float apexFade = smoothstep(0.006, z0, radius);
    res.normal  = normalize(vec3(cos(apexA)*tilt, sin(apexA)*tilt, 1.0-tilt));
    res.facetId = 300 + int(bezelOi) * 2 + (bezelTu < 0.5 ? 0 : 1);
    res.edgeMask = apexEdge * apexFade * 0.50;
  } else if (radius < z1) {
    float split = bezelTu < 0.5 ? -1.0 : 1.0;
    float outA = bezelOi * bezelSw + bezelSw * 0.5 + split * bezelSw * 0.33;
    float tilt = 0.24 + 0.06 * sin(seed * 2.1 + bezelOi * 0.9) + crownRise * 0.03;
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 1 + int(bezelOi) * 2 + (bezelTu < 0.5 ? 0 : 1);
  } else if (radius < z2) {
    float outA = starOi * starSw + starSw * 0.5 + antiqueTwist;
    float tilt = 0.40 + 0.08 * cos(seed * 2.6 + starOi * 0.7) + crownRise * 0.02;
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 17 + int(starOi);
  } else if (radius < z3) {
    float split = starTu < 0.5 ? -1.0 : 1.0;
    float outA = starOi * starSw + starSw * 0.5 + split * starSw * 0.20 + antiqueTwist;
    float tilt = 0.55 + 0.07 * sin(seed * 1.8 + starOi * 0.8);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 33 + int(starOi) + (starTu < 0.5 ? 0 : 16);
  } else if (radius < z4) {
    float outA = starOi * starSw + mix(starSw * 0.25, starSw * 0.75, step(0.5, starTu));
    float tilt = 0.70 + 0.05 * cos(seed * 2.2 + starOi * 0.9);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 65 + int(starOi) + (starTu < 0.5 ? 0 : 16);
  } else {
    float outA = starOi * starSw + starSw * 0.5;
    float tilt = 0.82 + 0.04 * sin(seed * 1.6 + starOi * 0.7);
    res.normal  = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
    res.facetId = 97 + int(starOi);
  }

  float dr = min(min(min(abs(radius-z0), abs(radius-z1)), min(abs(radius-z2), abs(radius-z3))),
                 min(abs(radius-z4), abs(radius-z5)));
  float daBezel = min(bezelSw*0.5 - abs(bezelOa), abs(bezelOa));
  float daStar = min(starSw*0.5 - abs(starOa), abs(starOa));

  res.edgeMask = max(
    res.edgeMask,
    max(
      1.0 - smoothstep(0.0, 0.010, min(dr, daStar)),
      (1.0 - smoothstep(0.0, 0.015, daBezel))
        * smoothstep(0.04, z3, radius)
        * smoothstep(z4, z1, radius)
        * 0.42
    )
  );
  res.edgeMask = max(
    res.edgeMask,
    (1.0 - smoothstep(0.0, 0.018, daBezel))
      * smoothstep(0.012, z0, radius)
      * 0.34
  );
  return res;
}
`;

export const JUBILEE_BORDER_RADIUS = "50%";

export function jubileeCssGradient(
  seed: number,
  borderRadius: string,
): React.CSSProperties {
  const bezelAngle = (seed * 0.31) % 45;
  const starAngle = 11.25 + ((seed * 0.23) % 22.5);
  const bezelStops = Array.from({ length: 8 }, (_, i) => {
    const start = i * 45;
    const peak = start + 22.5;
    const end = start + 38;
    return `transparent ${start}deg, rgba(255,255,255,0.16) ${peak}deg, transparent ${end}deg`;
  }).join(", ");
  const starStops = Array.from({ length: 16 }, (_, i) => {
    const start = i * 22.5;
    const peak = start + 11.25;
    const end = start + 18;
    return `transparent ${start}deg, rgba(255,255,255,0.08) ${peak}deg, transparent ${end}deg`;
  }).join(", ");

  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.20) 5%, transparent 10%),
      radial-gradient(circle at center, transparent 10%, rgba(255,255,255,0.11) 20%, transparent 34%, rgba(255,255,255,0.06) 52%, transparent 72%, rgba(255,255,255,0.03) 88%, transparent 100%),
      conic-gradient(from ${starAngle}deg at 50% 50%, ${starStops}, transparent 360deg),
      conic-gradient(from ${bezelAngle}deg at 50% 50%, ${bezelStops}, transparent 360deg)
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
