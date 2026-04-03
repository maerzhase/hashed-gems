const interFontPromises = new Map<string, Promise<ArrayBuffer>>();

export function loadInterFont(weight: 400 | 500 | 600, text: string): Promise<ArrayBuffer> {
  const key = `${weight}:${text}`;

  if (!interFontPromises.has(key)) {
    interFontPromises.set(
      key,
      (async () => {
        const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`;
        const cssResponse = await fetch(cssUrl, { cache: "force-cache" });

        if (!cssResponse.ok) {
          throw new Error(`failed to load Inter CSS: ${cssResponse.status}`);
        }

        const css = await cssResponse.text();
        const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype|woff2|woff)'\)/);

        if (!match) {
          throw new Error(`failed to find Inter font source for weight ${weight}`);
        }

        const fontResponse = await fetch(match[1], { cache: "force-cache" });

        if (!fontResponse.ok) {
          throw new Error(`failed to load Inter font: ${fontResponse.status}`);
        }

        return fontResponse.arrayBuffer();
      })(),
    );
  }

  return interFontPromises.get(key)!;
}
