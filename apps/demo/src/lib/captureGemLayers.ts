"use client";

export async function captureGemLayers(
  container: ParentNode | null,
): Promise<Blob | null> {
  const canvases = Array.from(
    container?.querySelectorAll("canvas.hashed-gem-layer") ?? [],
  ) as HTMLCanvasElement[];
  if (canvases.length === 0) return null;

  const { width, height } = canvases[0];
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;

  const ctx = out.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);
  for (const canvas of canvases) {
    ctx.drawImage(canvas, 0, 0, width, height);
  }

  return new Promise<Blob | null>((resolve) =>
    out.toBlob(resolve, "image/png"),
  );
}
