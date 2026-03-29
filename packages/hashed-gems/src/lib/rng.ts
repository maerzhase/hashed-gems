export function hashString128(str: string): [number, number, number, number] {
  let h1 = 0x811c9dc5 >>> 0;
  let h2 = 0x6a09e667 >>> 0;
  let h3 = 0xbb67ae85 >>> 0;
  let h4 = 0x3c6ef372 >>> 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ ch, 0x5bd1e995) >>> 0;
    h3 = Math.imul(h3 ^ ch, 0x1b873593) >>> 0;
    h4 = Math.imul(h4 ^ ch, 0xcc9e2d51) >>> 0;
  }
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b) >>> 0;
  h1 ^= h1 >>> 13;
  h2 ^= h2 >>> 16;
  h2 = Math.imul(h2, 0xc2b2ae35) >>> 0;
  h2 ^= h2 >>> 13;
  h3 ^= h3 >>> 16;
  h3 = Math.imul(h3, 0x85ebca6b) >>> 0;
  h3 ^= h3 >>> 13;
  h4 ^= h4 >>> 16;
  h4 = Math.imul(h4, 0xc2b2ae35) >>> 0;
  h4 ^= h4 >>> 13;
  return [h1, h2, h3, h4];
}

export function sfc32(seed: [number, number, number, number]): () => number {
  let [a, b, c, d] = seed;
  return () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
