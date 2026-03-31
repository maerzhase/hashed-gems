import type * as React from "react";

// ── ROSE CUT ─────────────────────────────────────────────────────────────────
// Classic rose cuts read as a domed rosette: a pointed center, broad triangular
// petals, and softer outer shoulders rather than the flatter table/ring stack
// of a round brilliant.

export const ROSE_GLSL = /* glsl */ `
CutResult computeRose(vec2 uv, float seed) {
  CutResult res;
  res.normal  = vec3(0.0, 0.0, 1.0);
  res.facetId = 0;
  res.edgeMask = 0.0;

  float angle  = atan(uv.y, uv.x);
  float bloomStrength = seededSpan(seed, 100.0, 0.035, 0.075);
  float radius = clamp(
    length(uv) / (0.90 * (1.0 + bloomStrength * cos(angle * 6.0 + seed * 0.41))),
    0.0,
    1.0
  );

  float petalSw = PI / 6.0;  // 12 broad petals
  float petalOa = mod(angle + petalSw*0.5, petalSw) - petalSw*0.5;
  float petalOi = floor((angle + petalSw*0.5) / petalSw);
  float petalTu = (petalOa + petalSw*0.5) / petalSw;

  float splitSw = PI / 12.0;  // 24 secondary splits
  float splitOa = mod(angle + splitSw*0.5, splitSw) - splitSw*0.5;
  float splitOi = floor((angle + splitSw*0.5) / splitSw);

  float bloom = 0.5 + 0.5 * cos(angle * 6.0 + seed * 0.41);
  float roseR = radius / (0.92 + 0.06 * bloom);

  float zj = 0.010 * sin(seed * 4.9 + petalOi * 1.1);
  float w0 = seededSpan(seed, 101.0, 0.06, 0.09);
  float w1 = seededSpan(seed, 102.0, 0.09, 0.13);
  float w2 = seededSpan(seed, 103.0, 0.14, 0.20);
  float w3 = seededSpan(seed, 104.0, 0.16, 0.22);
  float w4 = seededSpan(seed, 105.0, 0.14, 0.20);
  float w5 = seededSpan(seed, 106.0, 0.08, 0.12);
  float z0 = w0 + zj * 0.25;
  float z1 = z0 + w1;
  float z2 = z1 + w2;
  float z3 = z2 + w3;
  float z4 = z3 + w4;
  float z5 = min(0.91, z4 + w5);

  if (roseR < z0) {
    float apexA = petalOi * petalSw + (petalTu < 0.5 ? petalSw * 0.35 : petalSw * 0.65);
    float tilt = 0.090 + 0.018 * sin(seed * 1.7 + petalOi * 0.8);
    float apexDa = petalSw * 0.5 - abs(petalOa);
    float apexEdge = 1.0 - smoothstep(0.0, 0.018, apexDa);
    float apexFade = smoothstep(0.008, z0, roseR);
    res.normal  = normalize(vec3(cos(apexA) * tilt, sin(apexA) * tilt, 1.0 - tilt));
    res.facetId = 300 + int(petalOi) * 2 + (petalTu < 0.5 ? 0 : 1);
    res.edgeMask = apexEdge * apexFade * 0.48;
  } else if (roseR < z1) {
    float petalA = petalOi * petalSw + (petalTu < 0.5 ? petalSw * 0.30 : petalSw * 0.70);
    float tilt = 0.26 + 0.05 * sin(seed * 2.0 + petalOi * 0.9);
    res.normal  = normalize(vec3(cos(petalA) * tilt, sin(petalA) * tilt, 1.0 - tilt));
    res.facetId = 1 + int(petalOi) * 2 + (petalTu < 0.5 ? 0 : 1);
  } else if (roseR < z2) {
    float petalA = petalOi * petalSw + petalSw * 0.5 + 0.04 * sin(seed * 2.6 + splitOi * 0.7);
    float tilt = 0.42 + 0.07 * cos(seed * 2.5 + petalOi * 0.7);
    res.normal  = normalize(vec3(cos(petalA) * tilt, sin(petalA) * tilt, 1.0 - tilt));
    res.facetId = 25 + int(petalOi);
  } else if (roseR < z3) {
    float splitA = splitOi * splitSw + splitSw * 0.5;
    float twist = 0.05 * sin(seed * 3.1 + splitOi * 0.8);
    float tilt = 0.56 + 0.06 * sin(seed * 1.9 + splitOi * 0.65);
    res.normal  = normalize(vec3(cos(splitA + twist) * tilt, sin(splitA + twist) * tilt, 1.0 - tilt));
    res.facetId = 37 + int(splitOi);
  } else if (roseR < z4) {
    float shoulderA = petalOi * petalSw + (petalTu < 0.5 ? petalSw * 0.22 : petalSw * 0.78);
    float tilt = 0.70 + 0.05 * cos(seed * 2.3 + petalOi * 0.85);
    res.normal  = normalize(vec3(cos(shoulderA) * tilt, sin(shoulderA) * tilt, 1.0 - tilt));
    res.facetId = 61 + int(petalOi) * 2 + (petalTu < 0.5 ? 0 : 1);
  } else {
    float edgeA = petalOi * petalSw + petalSw * 0.5;
    float tilt = 0.80 + 0.03 * sin(seed * 1.5 + petalOi * 0.9);
    res.normal  = normalize(vec3(cos(edgeA) * tilt, sin(edgeA) * tilt, 1.0 - tilt));
    res.facetId = 85 + int(petalOi);
  }

  float dr = min(min(min(abs(roseR-z0), abs(roseR-z1)), min(abs(roseR-z2), abs(roseR-z3))),
                 min(abs(roseR-z4), abs(roseR-z5)));
  float daPetal = min(petalSw * 0.5 - abs(petalOa), abs(petalOa));
  float daSplit = splitSw * 0.5 - abs(splitOa);

  res.edgeMask = max(
    res.edgeMask,
    max(
      1.0 - smoothstep(0.0, 0.010, min(dr, daPetal)),
      (1.0 - smoothstep(0.0, 0.006, daSplit)) * smoothstep(z1, z4, roseR) * 0.50
    )
  );
  return res;
}
`;

export const ROSE_BORDER_RADIUS = "50%";

export function roseCssGradient(
  seed: number,
  borderRadius: string,
): React.CSSProperties {
  const petalAngle = (seed * 0.19) % 30;
  const shoulderAngle = 15 + ((seed * 0.11) % 30);

  const petalStops = Array.from({ length: 12 }, (_, i) => {
    const start = i * 30;
    const peak = start + 10;
    const end = start + 20;
    return `transparent ${start}deg, rgba(255,255,255,0.15) ${peak}deg, transparent ${end}deg`;
  }).join(", ");

  const shoulderStops = Array.from({ length: 6 }, (_, i) => {
    const start = i * 60;
    const peak = start + 30;
    const end = start + 46;
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
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0.18) 6%, transparent 12%),
      conic-gradient(from ${shoulderAngle}deg at 50% 50%, ${shoulderStops}, transparent 360deg),
      conic-gradient(from ${petalAngle}deg at 50% 50%, ${petalStops}, transparent 360deg)
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
