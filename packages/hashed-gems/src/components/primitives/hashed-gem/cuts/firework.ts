import type * as React from "react";

// FIREWORK CUT
// Dense radial spokes with alternating long and short burst facets.
// The outer rings use a star-shaped radial metric so the crown reads like
// an explosive bloom instead of a standard round brilliant.

export const FIREWORK_GLSL = /* glsl */ `
CutResult computeFirework(vec2 uv, float seed) {
  CutResult res;
  res.normal = vec3(0.0, 0.0, 1.0);
  res.facetId = 0;
  res.edgeMask = 0.0;

  float radius = length(uv) / 0.90;
  float angle = atan(uv.y, uv.x);

  float majorSpokes = 12.0;
  float majorSw = TWO_PI / majorSpokes;
  float majorOa = mod(angle + majorSw * 0.5, majorSw) - majorSw * 0.5;
  float majorOi = floor((angle + majorSw * 0.5) / majorSw);
  float spokeT = (majorOa + majorSw * 0.5) / majorSw;
  bool upperSplit = spokeT > 0.5;
  float subIndex = majorOi * 2.0 + (upperSplit ? 1.0 : 0.0);

  float minorSw = TWO_PI / 24.0;
  float minorOa = mod(angle + minorSw * 0.5, minorSw) - minorSw * 0.5;
  float minorOi = floor((angle + minorSw * 0.5) / minorSw);

  float microSw = TWO_PI / 48.0;
  float microOa = mod(angle + microSw * 0.5, microSw) - microSw * 0.5;
  float microOi = floor((angle + microSw * 0.5) / microSw);

  float burstWave = 0.5 + 0.5 * cos(angle * majorSpokes + seed * 0.75);
  float flareMetric = radius / (0.93 + 0.10 * burstWave);

  float zj = 0.020 * sin(seed * 5.9 + majorOi * 1.2);
  float z0 = 0.11 + zj * 0.4;
  float z1 = 0.23 + zj * 0.6;
  float z2 = 0.38 + zj;
  float z3 = 0.54 + zj;
  float z4 = 0.69 + zj * 0.7;
  float z5 = 0.82 + zj * 0.4;
  float z6 = 0.92;

  if (flareMetric < z0) {
    float tableA = majorOi * majorSw + majorSw * 0.5;
    float tableTilt = 0.040 + 0.015 * sin(seed * 1.8 + majorOi * 0.9);
    float tableDa = majorSw * 0.5 - abs(majorOa);
    float tableEdge = 1.0 - smoothstep(0.0, 0.016, tableDa);
    float tableFade = smoothstep(0.012, z0, flareMetric);
    res.normal = normalize(vec3(cos(tableA) * tableTilt, sin(tableA) * tableTilt, 1.0 - tableTilt));
    res.facetId = 300 + int(majorOi);
    res.edgeMask = tableEdge * tableFade * 0.46;
  } else if (flareMetric < z1) {
    float outA = majorOi * majorSw + majorSw * 0.5;
    float subA = 0.08 * sin(minorOi * 0.9 + seed * 2.1);
    float tilt = 0.24 + 0.08 * sin(seed * 2.0 + majorOi * 0.7);
    res.normal = normalize(vec3(cos(outA + subA) * tilt, sin(outA + subA) * tilt, 1.0 - tilt));
    res.facetId = 1 + int(majorOi);
  } else if (flareMetric < z2) {
    float branchA = majorOi * majorSw + (upperSplit ? majorSw * 0.72 : majorSw * 0.28);
    float tilt = 0.34 + 0.09 * cos(seed * 2.7 + subIndex * 0.8);
    res.normal = normalize(vec3(cos(branchA) * tilt, sin(branchA) * tilt, 1.0 - tilt));
    res.facetId = 17 + int(subIndex);
  } else if (flareMetric < z3) {
    float sparkA = minorOi * minorSw + minorSw * 0.5;
    float twist = 0.06 * sin(seed * 3.4 + microOi * 0.6);
    float tilt = 0.48 + 0.08 * sin(seed * 1.9 + minorOi * 0.65);
    res.normal = normalize(vec3(cos(sparkA + twist) * tilt, sin(sparkA + twist) * tilt, 1.0 - tilt));
    res.facetId = 41 + int(minorOi);
  } else if (flareMetric < z4) {
    float cometA = majorOi * majorSw + (upperSplit ? majorSw * 0.82 : majorSw * 0.18);
    float tail = 0.04 * cos(seed * 2.6 + majorOi * 1.3);
    float tilt = 0.60 + 0.07 * sin(seed * 2.2 + subIndex * 0.9);
    res.normal = normalize(vec3(cos(cometA + tail) * tilt, sin(cometA + tail) * tilt, 1.0 - tilt));
    res.facetId = 65 + int(subIndex);
  } else if (flareMetric < z5) {
    float flashA = minorOi * minorSw + minorSw * 0.5;
    float tilt = 0.72 + 0.05 * sin(seed * 2.5 + minorOi * 0.7);
    res.normal = normalize(vec3(cos(flashA) * tilt, sin(flashA) * tilt, 1.0 - tilt));
    res.facetId = 89 + int(minorOi);
  } else if (flareMetric < z6) {
    float ringA = majorOi * majorSw + majorSw * 0.5;
    float tilt = 0.80 + 0.04 * sin(seed * 1.6 + majorOi * 1.1);
    res.normal = normalize(vec3(cos(ringA) * tilt, sin(ringA) * tilt, 1.0 - tilt));
    res.facetId = 113 + int(majorOi);
  } else {
    float edgeA = minorOi * minorSw + minorSw * 0.5;
    float tilt = 0.86 + 0.03 * cos(seed * 1.7 + minorOi * 0.8);
    res.normal = normalize(vec3(cos(edgeA) * tilt, sin(edgeA) * tilt, 1.0 - tilt));
    res.facetId = 129 + int(minorOi);
  }

  float dr = min(
    min(min(abs(flareMetric - z0), abs(flareMetric - z1)), min(abs(flareMetric - z2), abs(flareMetric - z3))),
    min(min(abs(flareMetric - z4), abs(flareMetric - z5)), abs(flareMetric - z6))
  );
  float daMajor = majorSw * 0.5 - abs(majorOa);
  float daMinor = minorSw * 0.5 - abs(minorOa);
  float daMicro = microSw * 0.5 - abs(microOa);

  res.edgeMask = max(
    1.0 - smoothstep(0.0, 0.010, min(daMajor * 0.7, dr)),
    max(
      (1.0 - smoothstep(0.0, 0.006, daMinor)) * 0.65,
      (1.0 - smoothstep(0.0, 0.0035, daMicro)) * smoothstep(z1, z5, flareMetric) * 0.45
    )
  );
  return res;
}
`;

export const FIREWORK_BORDER_RADIUS = "50%";

export function fireworkCssGradient(
  seed: number,
  borderRadius: string,
): React.CSSProperties {
  const rotOffset = seed % 360;
  const fromAngle = 7.5 + (rotOffset % 30);
  const secondaryAngle = fromAngle + 15;

  const majorStops = Array.from({ length: 12 }, (_, i) => {
    const start = i * 30;
    const mid = start + 7.5;
    const end = start + 15;
    return `transparent ${start}deg, rgba(255,255,255,0.16) ${mid}deg, transparent ${end}deg`;
  }).join(", ");

  const secondaryStops = Array.from({ length: 12 }, (_, i) => {
    const start = i * 30;
    const mid = start + 3.75;
    const end = start + 7.5;
    return `transparent ${start}deg, rgba(255,255,255,0.09) ${mid}deg, transparent ${end}deg`;
  }).join(", ");

  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 12%, transparent 28%),
      radial-gradient(circle at 50% 50%, transparent 34%, rgba(255,255,255,0.10) 52%, transparent 68%),
      radial-gradient(circle at 50% 50%, transparent 72%, rgba(255,255,255,0.08) 84%, transparent 100%),
      conic-gradient(from ${fromAngle}deg at 50% 50%, ${majorStops}, transparent 360deg),
      conic-gradient(from ${secondaryAngle}deg at 50% 50%, ${secondaryStops}, transparent 360deg)
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}
