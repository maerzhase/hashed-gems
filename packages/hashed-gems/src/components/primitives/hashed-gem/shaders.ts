export const VERTEX_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

#define PI     3.14159265359
#define TWO_PI 6.28318530718

uniform float uTime;
uniform float uSeed;
uniform int   uCausticCount;
uniform vec2  uResolution;
uniform int   uGemType;  // 0=diamond 1=ruby 2=sapphire 3=emerald 4=topaz 5=amethyst 6=aquamarine
                         // 7=rose-quartz 8=citrine 9=onyx 10=alexandrite 11=opal
uniform int   uCutType;  // 0=round-brilliant 1=princess 2=cushion 3=emerald-step
uniform int   uRarity;   // 0=common 1=uncommon 2=rare 3=epic 4=legendary

in  vec2 vUv;
out vec4 outColor;

/* ── Utilities ─────────────────────────────────────────────────────────────── */

vec3 hue2rgb(float h) {
  return clamp(vec3(abs(h*6.0-3.0)-1.0, 2.0-abs(h*6.0-2.0), 2.0-abs(h*6.0-4.0)), 0.0, 1.0);
}

float hash11(float p) { return fract(sin(p * 127.1) * 43758.5453); }
float hash21(vec2 p)  { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float f0FromIOR(float n) { float x = (1.0 - n) / (1.0 + n); return x * x; }

float fresnelSchlick(float f0v, float cosT) {
  return f0v + (1.0 - f0v) * pow(clamp(1.0 - cosT, 0.0, 1.0), 5.0);
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
  float env = 0.02;
  env += max(0.0, d.z) * 0.06;

  float lt = uTime * 0.18;

  vec3 w1 = normalize(vec3(cos(lt * 0.7 + uSeed) * 0.5, sin(lt * 0.4) * 0.3, 0.82));
  env += pow(max(0.0, dot(d, w1)), 8.0) * 8.0;

  vec3 w2 = normalize(vec3(-cos(lt * 0.5 + uSeed * 0.7) * 0.4, cos(lt * 0.3) * 0.5, 0.72));
  env += pow(max(0.0, dot(d, w2)), 12.0) * 3.0;

  vec3 s1 = normalize(vec3(sin(lt * 1.1 + uSeed * 1.3) * 0.7, cos(lt * 0.9) * 0.7, 0.5));
  env += pow(max(0.0, dot(d, s1)), 80.0) * 45.0;

  vec3 s2 = normalize(vec3(cos(lt * 0.8 - uSeed * 0.9) * 0.6, -sin(lt * 1.2) * 0.6, 0.58));
  env += pow(max(0.0, dot(d, s2)), 64.0) * 30.0;

  float equator = 1.0 - abs(d.z);
  env += pow(equator, 3.0) * 1.2;

  env += 0.06 * max(0.0, sin(d.x*7.0 + d.y*5.0 + uSeed*0.7) * cos(d.y*6.0 - d.x*4.0 + lt*0.5));
  env += 0.04 * max(0.0, sin(d.x*13.0 + d.z*9.0 + uSeed*1.3) * cos(d.y*11.0 - d.z*7.0 + lt*0.3));

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

void main() {

  /* ── 1. Coordinates ──────────────────────────────────────────────────── */
  vec2 uv = vUv;
  uv.x *= uResolution.x / uResolution.y;
  uv *= 0.90;

  float r = max(abs(uv.x), abs(uv.y));
  float radNorm = clamp(r / 0.90, 0.0, 1.0);

  vec3 viewDir = normalize(vec3(-uv * 0.12, 1.0));

  /* ── 2. Gem optical properties ─────────────────────────────────────────── */
  float ior, dispAmt;
  vec3  absorbCoeff;
  vec3  gemBodyColor;
  bool  isAlexandrite = false;
  bool  isOpal        = false;

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
    // Alexandrite: time-varying absorption shifts green ↔ red
    float alexT = 0.5 + 0.5 * sin(uTime * 0.12 + uSeed * 0.7);
    absorbCoeff = mix(vec3(2.8, 0.15, 1.2), vec3(0.18, 2.8, 2.5), alexT);
    gemBodyColor = mix(vec3(0.08, 0.85, 0.35), vec3(0.90, 0.10, 0.45), alexT); }
  else { ior=1.45; dispAmt=0.012; isOpal=true;
    absorbCoeff = vec3(0.3, 0.25, 0.2);
    gemBodyColor = vec3(0.92, 0.90, 0.88); } // Opal — base milky white

  float f0 = f0FromIOR(ior);

  // Rarity-based sparkle multiplier (computed here, applied later)
  float raritySparkle = 1.0;
  float rarityGlow    = 0.0;
  if      (uRarity == 1) { raritySparkle = 1.05; }
  else if (uRarity == 2) { raritySparkle = 1.1; rarityGlow = 0.04; }
  else if (uRarity == 3) { raritySparkle = 1.2; rarityGlow = 0.06; }
  else if (uRarity == 4) { raritySparkle = 1.35; rarityGlow = 0.10; }

  /* ── 3. Crown facet geometry ───────────────────────────────────────────── */
  /* Each cut has a fundamentally different facet layout:                     */
  /* Round Brilliant: 16-fold radial symmetry, many small triangular facets  */
  /* Princess: 4-fold with chevron/V patterns pointing to corners            */
  /* Cushion: 8-fold with broad, chunky "pillow" facets                      */
  /* Emerald Step: concentric rectangular bands (hall-of-mirrors)             */

  int   facetId     = 0;
  vec3  crownNormal = vec3(0.0, 0.0, 1.0);
  float edgeMask    = 0.0;

  float angle = atan(uv.y, uv.x);
  float radius = r / 0.90;

  if (uCutType == 3) {
    // ── EMERALD STEP CUT — concentric rectangular bands ──
    float asp  = 1.0 + 0.28 * fract(uSeed * 0.031);
    vec2  aUv  = abs(uv);
    vec2  sUv  = aUv / vec2(0.90 * asp, 0.90);
    float lInf = max(sUv.x, sUv.y);
    bool  isX  = (sUv.x >= sUv.y);
    float fDir = isX ? sign(uv.x) : sign(uv.y);
    float tilX = isX ? fDir : 0.0;
    float tilY = isX ? 0.0  : fDir;
    float diagDist = abs(sUv.x - sUv.y) / max(lInf, 0.001);
    float diagT    = smoothstep(0.0, 0.18, diagDist);

    // 8 concentric step bands — many more than before for finer detail
    float sb0=0.12, sb1=0.24, sb2=0.36, sb3=0.48, sb4=0.58, sb5=0.68, sb6=0.78, sb7=0.87;
    float tilt = 0.0;

    if (lInf < sb0) {
      facetId = 0; crownNormal = vec3(0.0, 0.0, 1.0);
    } else {
      if      (lInf < sb1) { tilt = 0.12 + 0.03*sin(uSeed*1.7); facetId = 10; }
      else if (lInf < sb2) { tilt = 0.22 + 0.03*sin(uSeed*2.3); facetId = 20; }
      else if (lInf < sb3) { tilt = 0.33 + 0.04*sin(uSeed*3.1); facetId = 30; }
      else if (lInf < sb4) { tilt = 0.44 + 0.04*sin(uSeed*2.7); facetId = 40; }
      else if (lInf < sb5) { tilt = 0.55 + 0.03*sin(uSeed*1.9); facetId = 50; }
      else if (lInf < sb6) { tilt = 0.65 + 0.03*sin(uSeed*2.1); facetId = 55; }
      else if (lInf < sb7) { tilt = 0.75 + 0.03*sin(uSeed*1.5); facetId = 58; }
      else                 { tilt = 0.85;                         facetId = 60; }

      vec3 faceN = normalize(vec3(tilX*tilt, tilY*tilt, 1.0-tilt));
      vec3 cornN = normalize(vec3(sign(uv.x)*tilt*0.7071, sign(uv.y)*tilt*0.7071, 1.0-tilt));
      crownNormal = normalize(mix(cornN, faceN, diagT));
    }

    float drStp = min(min(min(abs(lInf-sb0), abs(lInf-sb1)), min(abs(lInf-sb2), abs(lInf-sb3))),
                      min(min(abs(lInf-sb4), abs(lInf-sb5)), min(abs(lInf-sb6), abs(lInf-sb7))));
    edgeMask = max(1.0 - smoothstep(0.0, 0.012, drStp),
                   (1.0 - smoothstep(0.0, 0.03, diagDist)) * 0.6);

  } else if (uCutType == 1) {
    // ── PRINCESS CUT — 4-fold with chevron/V patterns ──
    // Distinctive: diagonal V-lines radiating from center to corners
    // Plus concentric square bands — creates a grid/cross pattern
    float ax = abs(uv.x), ay = abs(uv.y);
    float diagR = (ax + ay) / (0.90 * 1.414);  // diagonal distance
    float sqR   = max(ax, ay) / 0.90;           // square distance

    // Chevron angle: which quadrant diagonal are we near?
    float chevAng = atan(ay, ax);  // 0 to PI/2 within each quadrant
    float chevOa  = abs(chevAng - PI * 0.25);  // distance from diagonal
    float quadrant = floor(angle / (PI * 0.5) + 0.5);  // which quadrant

    // Concentric square zones (7 zones for fine detail)
    float zj = 0.02 * sin(uSeed * 5.7 + quadrant * 1.4);
    float z0=0.10+zj, z1=0.22+zj, z2=0.34+zj, z3=0.46+zj, z4=0.58+zj, z5=0.70+zj, z6=0.82+zj;

    // Chevron subdivision: split each zone along the diagonal
    bool nearDiag = chevOa < 0.22;
    float chevSide = chevAng > PI*0.25 ? 1.0 : -1.0;

    if (sqR < z0) {
      facetId = 0; crownNormal = vec3(0.0, 0.0, 1.0);
    } else {
      float tilt;
      float outA = quadrant * PI * 0.5 + PI * 0.25; // toward corner
      float sideA = quadrant * PI * 0.5;              // toward edge

      if (sqR < z1) {
        tilt = 0.15 + 0.05*sin(uSeed*1.7);
        facetId = nearDiag ? 10 : 11;
        float a = nearDiag ? outA : sideA + chevSide * 0.3;
        crownNormal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
      } else if (sqR < z2) {
        tilt = 0.25 + 0.06*sin(uSeed*2.3);
        facetId = nearDiag ? 20 : 21;
        float a = nearDiag ? outA : sideA + chevSide * 0.25;
        crownNormal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
      } else if (sqR < z3) {
        tilt = 0.35 + 0.06*sin(uSeed*3.1);
        facetId = nearDiag ? 30 : (chevSide > 0.0 ? 31 : 32);
        float a = nearDiag ? outA : sideA + chevSide * 0.2;
        crownNormal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
      } else if (sqR < z4) {
        tilt = 0.45 + 0.05*sin(uSeed*2.7);
        facetId = nearDiag ? 40 : (chevSide > 0.0 ? 41 : 42);
        float a = nearDiag ? outA + 0.1*sin(uSeed) : sideA + chevSide * 0.15;
        crownNormal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
      } else if (sqR < z5) {
        tilt = 0.55 + 0.05*sin(uSeed*1.9);
        facetId = nearDiag ? 50 : (chevSide > 0.0 ? 51 : 52);
        float a = nearDiag ? outA : sideA + chevSide * 0.12;
        crownNormal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
      } else if (sqR < z6) {
        tilt = 0.65 + 0.04*sin(uSeed*2.1);
        facetId = nearDiag ? 55 : (chevSide > 0.0 ? 56 : 57);
        float a = nearDiag ? outA : sideA + chevSide * 0.10;
        crownNormal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
      } else {
        tilt = 0.72 + 0.03*sin(uSeed*1.5);
        facetId = 60;
        float a = nearDiag ? outA : sideA;
        crownNormal = normalize(vec3(cos(a)*tilt, sin(a)*tilt, 1.0-tilt));
      }
    }

    // Edge mask: square zone boundaries + diagonal chevron lines
    float drP = min(min(min(abs(sqR-z0), abs(sqR-z1)), min(abs(sqR-z2), abs(sqR-z3))),
                    min(min(abs(sqR-z4), abs(sqR-z5)), abs(sqR-z6)));
    float diagEdge = abs(chevOa - 0.22);
    edgeMask = max(1.0 - smoothstep(0.0, 0.012, drP),
                   (1.0 - smoothstep(0.0, 0.015, diagEdge)) * 0.7);

  } else if (uCutType == 2) {
    // ── CUSHION CUT — 8-fold with broad chunky facets ──
    // Distinctive: larger, fewer facets with rounded transitions
    // Looks like a pillow — softer, broader facet areas
    float p = 2.5;
    float cshR = pow(pow(abs(uv.x), p) + pow(abs(uv.y), p), 1.0 / p) / 0.90;

    float sw = PI / 4.0;  // 8-fold
    float oa = mod(angle + sw*0.5, sw) - sw*0.5;
    float oi = floor((angle + sw*0.5) / sw);

    // Fewer, wider radial zones — creates the "chunky" look
    float zj = 0.025 * sin(uSeed * 7.3 + oi * 1.4);
    float z0=0.18+zj, z1=0.38+zj, z2=0.56+zj, z3=0.72+zj*0.7, z4=0.85+zj*0.4;

    // Each zone is split into 2 sub-facets by the angular midpoint
    bool upperHalf = oa > 0.0;
    float subOi = oi * 2.0 + (upperHalf ? 1.0 : 0.0);

    if (cshR < z0) {
      facetId = 0; crownNormal = vec3(0.0, 0.0, 1.0);
    } else if (cshR < z1) {
      float outA = oi*sw + sw*0.5;
      float tilt = 0.20 + 0.08*sin(uSeed*1.7 + subOi*0.9);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 1 + int(subOi);
    } else if (cshR < z2) {
      float outA = oi*sw + (upperHalf ? sw*0.7 : sw*0.3);
      float tilt = 0.38 + 0.10*cos(uSeed*2.3 + subOi*0.7);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 17 + int(subOi);
    } else if (cshR < z3) {
      float outA = oi*sw + (upperHalf ? sw*0.75 : sw*0.25);
      float tilt = 0.52 + 0.08*sin(uSeed*3.1 + subOi*0.8);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 33 + int(subOi);
    } else if (cshR < z4) {
      float outA = oi*sw + sw*0.5;
      float tilt = 0.65 + 0.06*sin(uSeed*2.7 + oi*0.9);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 49 + int(oi);
    } else {
      float outA = oi*sw + sw*0.5;
      float tilt = 0.75 + 0.04*sin(uSeed*1.9 + oi*1.1);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 57 + int(oi);
    }

    float dr  = min(min(min(abs(cshR-z0), abs(cshR-z1)), abs(cshR-z2)),
                    min(abs(cshR-z3), abs(cshR-z4)));
    float da  = min(sw*0.5 - abs(oa), abs(oa));
    edgeMask  = max(1.0 - smoothstep(0.0, 0.014, min(da * 0.7, dr)),
                    0.0);

  } else {
    // ── ROUND BRILLIANT — 16-fold, many small triangular facets ──
    float sw  = PI / 8.0;  // 16-fold
    float oa  = mod(angle + sw*0.5, sw) - sw*0.5;
    float oi  = floor((angle + sw*0.5) / sw);
    float tu  = (oa + sw*0.5) / sw;

    // Sub-facet angular subdivision
    float twist = 0.50 + 0.25 * fract(uSeed * 0.017);
    float sang  = angle + radius * twist;
    float sw2   = TWO_PI / 32.0;  // 32 sub-facets
    float oa2   = mod(sang + sw2*0.5, sw2) - sw2*0.5;
    float oi2f  = floor((sang + sw2*0.5) / sw2);

    // 7 radial zones for fine detail (more than before)
    float zj = 0.025 * sin(uSeed * 7.3 + oi * 1.4);
    float z1=0.12+zj, z2=0.26+zj, z3=0.40+zj, z4=0.54+zj, z5=0.66+zj*0.7, z6=0.78+zj*0.4, z7=0.88;

    if (radius < z1) {
      facetId = 0; crownNormal = vec3(0.0, 0.0, 1.0);
    } else if (radius < z2) {
      // Star facets
      float outA = oi*sw + sw*0.5;
      float tilt = 0.18 + 0.06*sin(uSeed*1.7+oi*0.78) + 0.03*sin(oi2f*2.1+uSeed*3.3);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 1 + int(oi);
    } else if (radius < z3) {
      // Upper bezel
      float outA = oi*sw + sw*0.5;
      float subA = 0.06 * cos(oi2f*1.9 + uSeed*1.4);
      float tilt = 0.30 + 0.08*cos(uSeed*2.3+oi*0.79) + 0.04*sin(oi2f*1.5+uSeed);
      crownNormal = normalize(vec3(cos(outA+subA)*tilt, sin(outA+subA)*tilt, 1.0-tilt));
      facetId = 17 + int(oi) + (int(oi2f) % 2) * 16;
    } else if (radius < z4) {
      // Main kite facets
      float sOff = tu < 0.5 ? sw*0.25 : sw*0.75;
      float outA = oi*sw + sOff;
      float tilt = 0.42 + 0.08*sin(uSeed*3.1+oi*0.81);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 49 + int(oi) + (tu < 0.5 ? 0 : 16);
    } else if (radius < z5) {
      // Upper girdle A
      float sOff = tu < 0.5 ? sw*0.20 : sw*0.80;
      float outA = oi*sw + sOff;
      float subA = 0.05 * sin(oi2f*1.7 + uSeed*2.8);
      float tilt = 0.55 + 0.07*sin(uSeed*2.7+oi*0.93);
      crownNormal = normalize(vec3(cos(outA+subA)*tilt, sin(outA+subA)*tilt, 1.0-tilt));
      facetId = 81 + int(oi) + (tu < 0.5 ? 0 : 16);
    } else if (radius < z6) {
      // Upper girdle B
      float outA = oi*sw + sw*0.5;
      float tilt = 0.65 + 0.05*sin(uSeed*1.9+oi*1.1);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 113 + int(oi);
    } else if (radius < z7) {
      // Lower girdle
      float sOff = tu < 0.5 ? sw*0.30 : sw*0.70;
      float outA = oi*sw + sOff;
      float tilt = 0.73 + 0.04*sin(uSeed*2.1+oi*0.87);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 129 + int(oi) + (tu < 0.5 ? 0 : 16);
    } else {
      // Girdle edge
      float outA = oi*sw + sw*0.5;
      float tilt = 0.80 + 0.03*sin(uSeed*1.5+oi*0.73);
      crownNormal = normalize(vec3(cos(outA)*tilt, sin(outA)*tilt, 1.0-tilt));
      facetId = 161 + int(oi);
    }

    float dr  = min(min(min(abs(radius-z1), abs(radius-z2)), min(abs(radius-z3), abs(radius-z4))),
                    min(min(abs(radius-z5), abs(radius-z6)), abs(radius-z7)));
    float da  = min(sw*0.5 - abs(oa), abs(oa));
    float da2 = sw2*0.5 - abs(oa2);
    edgeMask  = max(1.0 - smoothstep(0.0, 0.010, min(da, dr)),
                    (1.0 - smoothstep(0.0, 0.005, da2)) * 0.5);
  }

  /* ── 4. Internal facet layer ───────────────────────────────────────────── */
  float iFolds = 24.0;
  float iAng = atan(uv.y, uv.x) + 0.43 + uSeed * 0.29;
  float iRad = r / 0.90;
  float iSw  = PI / iFolds;
  float iOa  = mod(iAng + iSw*0.5, iSw) - iSw*0.5;
  float iOi  = floor((iAng + iSw*0.5) / iSw);
  float ij   = 0.025 * sin(uSeed*5.1 + iOi*1.8);
  float iz1 = 0.14+ij, iz2 = 0.34+ij, iz3 = 0.54+ij*0.7, iz4 = 0.72+ij*0.4, iz5 = 0.88;

  vec3  innerNormal  = vec3(0.0, 0.0, 1.0);
  int   innerFacetId = 100;

  if (iRad >= iz1) {
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
  float innerEdge = 1.0 - smoothstep(0.0, 0.008, min(iDa, iDr));

  /* ── 5. Deep internal layer ────────────────────────────────────────────── */
  float dFolds = 32.0;
  float dAng = atan(uv.y, uv.x) - 0.67 + uSeed * 0.41;
  float dRad = r / 0.90;
  float dSw  = PI / dFolds;
  float dOa  = mod(dAng + dSw*0.5, dSw) - dSw*0.5;
  float dOi  = floor((dAng + dSw*0.5) / dSw);
  float dj   = 0.020 * sin(uSeed*3.7 + dOi*2.1);
  float dz1 = 0.12+dj, dz2 = 0.30+dj, dz3 = 0.50+dj*0.7, dz4 = 0.68+dj*0.4, dz5 = 0.84;

  vec3  deepNormal  = vec3(0.0, 0.0, 1.0);
  int   deepFacetId = 200;

  if (dRad >= dz1) {
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
  float deepEdge = 1.0 - smoothstep(0.0, 0.006, min(dDa, dDr));

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

  /* ── 7. Surface reflection ─────────────────────────────────────────────── */
  vec3  surfReflDir = reflect(-viewDir, crownNormal);
  float surfEnv     = sampleEnv(surfReflDir);
  vec3  surfaceLight = vec3(surfEnv * 1.4) * fresnel;

  /* ── 8. Internal light — 7-sample spectral rendering ───────────────────── */
  /* Instead of 3 RGB samples, we sample the environment at 7 wavelengths    */
  /* spanning the visible spectrum, weight each by its CIE color, and        */
  /* accumulate. This produces physically accurate rainbow fire.             */

  vec3  intReflDir = reflect(-viewDir, internalNormal);
  vec3  dispAxis   = normalize(cross(intReflDir, internalNormal));

  // 7 wavelengths spanning visible spectrum (400–660 nm)
  vec3 spectralAccum = vec3(0.0);
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
    vec3 sDir = normalize(intReflDir + dispAxis * offset);
    float envSample = sampleEnv(sDir);
    spectralAccum += spectralColor(wl) * envSample;
  }
  vec3 internalEnv = spectralAccum / 3.5; // normalize (7 samples, ~0.5 avg color weight)

  // Per-facet extinction
  float fid    = float(facetId);
  float fHash  = hash11(fid * 1.731 + uSeed * 3.117);
  float fBlink = 0.5 + 0.5 * sin(uTime * 0.7 + fHash * TWO_PI + fid * 0.59);
  float extMix = pow(fHash * 0.50 + fBlink * 0.50, 0.6);
  float extinction = mix(0.01, 4.0, extMix);

  float facing = max(dot(internalNormal, viewDir), 0.0);
  float facingReject = smoothstep(0.0, 0.30, facing);
  extinction *= max(facingReject, 0.15);

  // Beer-Lambert absorption
  float pathLen    = 0.35 * (1.0 + radNorm * 1.5);
  vec3  absorption = exp(-absorbCoeff * pathLen);

  // Internal color tinting
  vec3 internalTint;
  if (uGemType == 0) {
    internalTint = gemBodyColor;
  } else if (isOpal) {
    // Opal: play-of-color — shifting spectral patches across the surface
    float oN1 = sin(uv.x*4.0 + uv.y*2.5 + uSeed*0.7 + uTime*0.15);
    float oN2 = sin(uv.x*2.5 - uv.y*4.5 + uSeed*1.3 + uTime*0.08);
    float oN3 = sin(uv.x*6.0 + uv.y*3.5 + uSeed*2.1 - uTime*0.12);
    float opalHue = fract(oN1 * 0.3 + oN2 * 0.25 + oN3 * 0.15 + uSeed * 0.1);
    vec3 opalPlay = hue2rgb(opalHue) * 0.5 + vec3(0.2);
    internalTint = opalPlay * absorption;
  } else {
    internalTint = absorption * 2.2;
  }

  vec3 internalLight = internalEnv * internalTint * extinction * (1.0 - fresnel);

  /* ── 9. Combine ────────────────────────────────────────────────────────── */
  vec3 rawColor = surfaceLight + internalLight;

  /* ── 10. Cut-specific light patterns ───────────────────────────────────── */
  if (uCutType == 0) {
    float arrowAng  = atan(uv.y, uv.x);
    float arrowOa   = mod(arrowAng + PI/8.0, PI/4.0) - PI/8.0;
    float arrowMask = smoothstep(0.05, 0.13, abs(arrowOa));
    float arrowRad  = smoothstep(0.15, 0.35, radNorm) * smoothstep(0.78, 0.58, radNorm);
    rawColor *= 1.0 - (1.0 - arrowMask) * arrowRad * 0.35;
  }

  if (uCutType == 1) {
    float crossAng  = atan(uv.y, uv.x);
    float crossOa   = mod(crossAng + PI/4.0, PI/2.0) - PI/4.0;
    float crossMask = smoothstep(0.06, 0.18, abs(crossOa));
    float crossRad  = smoothstep(0.20, 0.40, radNorm) * smoothstep(0.85, 0.60, radNorm);
    rawColor *= 1.0 - (1.0 - crossMask) * crossRad * 0.25;
  }

  /* ── 11. Scintillation ─────────────────────────────────────────────────── */
  float lt = uTime * 0.18;
  vec3 l1 = normalize(vec3(cos(lt*0.7+uSeed)*0.5, sin(lt*0.4)*0.3, 0.82));
  vec3 l2 = normalize(vec3(sin(lt*1.1+uSeed*1.3)*0.7, cos(lt*0.9)*0.7, 0.5));
  vec3 l3 = normalize(vec3(cos(lt*0.8-uSeed*0.9)*0.6, -sin(lt*1.2)*0.6, 0.58));

  vec3 h1 = normalize(l1 + viewDir);
  vec3 h2 = normalize(l2 + viewDir);
  vec3 h3 = normalize(l3 + viewDir);

  float shinBase, shinRange, spkThresh, spkIntensity;
  if (uCutType == 0) {
    shinBase = 1200.0; shinRange = 800.0; spkThresh = 0.60; spkIntensity = 35.0;
  } else if (uCutType == 1) {
    shinBase = 800.0;  shinRange = 500.0; spkThresh = 0.55; spkIntensity = 40.0;
  } else if (uCutType == 2) {
    shinBase = 500.0;  shinRange = 300.0; spkThresh = 0.50; spkIntensity = 28.0;
  } else {
    shinBase = 300.0;  shinRange = 150.0; spkThresh = 0.72; spkIntensity = 12.0;
  }

  // Rarity boosts sparkle intensity
  spkIntensity *= raritySparkle;

  float shin1 = max(shinBase + shinRange*cos(uTime*1.1 + fid*2.4 + uSeed*0.7), 1.0);
  float shin2 = max(shinBase*0.75 + shinRange*0.8*sin(uTime*0.8 + fid*1.7 + uSeed*1.3), 1.0);
  float shin3 = max(shinBase*0.85 + shinRange*0.6*cos(uTime*0.6 + fid*3.1), 1.0);

  float spk1 = pow(max(0.0, dot(crownNormal, h1)), shin1);
  float spk2 = pow(max(0.0, dot(crownNormal, h2)), shin2);
  float spk3 = pow(max(0.0, dot(crownNormal, h3)), shin3);

  rawColor += vec3(step(spkThresh, spk1)) * spkIntensity;
  rawColor += vec3(step(spkThresh + 0.05, spk2)) * spkIntensity * 0.7;
  rawColor += vec3(step(spkThresh + 0.08, spk3)) * spkIntensity * 0.5;

  // Spectral sparkle — rainbow fire flashes
  float dispAngle = fract(fid * 0.618 + uSeed * 0.137);
  vec3 spkColor = (uGemType == 0 || uGemType == 9 || isOpal)
    ? hue2rgb(fract(dispAngle + uTime * 0.02))
    : vec3(1.0);
  float spkTotal = step(spkThresh, spk1) + step(spkThresh + 0.05, spk2) * 0.7;
  rawColor += spkColor * spkTotal * spkIntensity * 0.04;

  /* ── 12. Facet edge effects ────────────────────────────────────────────── */
  edgeMask *= 0.85 + 0.30 * hash21(uv * 47.0 + vec2(uSeed * 0.3));

  float edgeLit  = smoothstep(0.15, 0.6, (spectralAccum.g / 3.5) * extinction);
  float edgeGlow = edgeMask * edgeLit * (0.4 + 0.4 * sin(uTime * 1.0 + fid * 0.9));
  float edgeHue  = fract(atan(uv.y, uv.x) / TWO_PI * 3.0 + radNorm * 0.4 + uTime * 0.05);
  vec3  edgeColor = (uGemType == 0 || uGemType == 9) ? hue2rgb(edgeHue) : gemBodyColor * 1.2;
  rawColor += edgeColor * edgeGlow * 0.25;
  rawColor *= 1.0 - edgeMask * 0.10;

  /* ── 13. Rarity visual effects ─────────────────────────────────────────── */

  // Epic/Legendary: star sapphire-style asterism (6-pointed star overlay)
  if (uRarity >= 3) {
    float starBright = 0.0;
    float ang = atan(uv.y, uv.x);
    float dist = length(uv);
    for (int si = 0; si < 3; si++) {
      float starAng = float(si) * PI / 3.0 + uSeed * 0.3;
      float lineDist = abs(sin(ang - starAng)) * dist;
      float starLine = smoothstep(0.025, 0.005, lineDist) * smoothstep(0.90, 0.10, dist);
      starBright += starLine;
    }
    float starPulse = 0.6 + 0.4 * sin(uTime * 0.5 + uSeed);
    rawColor += vec3(starBright * starPulse * 2.5);
  }

  // Rare+: subtle outer glow
  if (rarityGlow > 0.0) {
    float glowR = max(abs(uv.x), abs(uv.y));
    float glow = smoothstep(0.60, 0.90, glowR) * rarityGlow;
    float glowPulse = 0.7 + 0.3 * sin(uTime * 0.8 + uSeed * 1.5);
    rawColor += gemBodyColor * glow * glowPulse * 3.0;
  }

  /* ── 14. Tonemap ───────────────────────────────────────────────────────── */
  vec3 color = tonemap(rawColor);

  outColor = vec4(color, 1.0);
}
`;
