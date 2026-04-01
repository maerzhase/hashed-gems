"use client";

import { HashedGem } from "@m3000/hashed-gems";
import { useEffect, useRef } from "react";
import { GEM_IMAGE_RESOLUTION } from "@/lib/gemImage";

const READY_DATASET_KEY = "gemReady";
const SAMPLE_SIZE = 64;
const RENDER_TIMEOUT_MS = 10_000;

function hasOpaquePixels(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;

  const start = (GEM_IMAGE_RESOLUTION - SAMPLE_SIZE) / 2;
  const { data } = context.getImageData(start, start, SAMPLE_SIZE, SAMPLE_SIZE);

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] !== 0) return true;
  }

  return false;
}

export function GemImageRenderClient({ seed }: { seed: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId = 0;
    let timeoutId = 0;

    const html = document.documentElement;
    html.dataset[READY_DATASET_KEY] = "0";

    const markReady = (value: "1" | "error") => {
      html.dataset[READY_DATASET_KEY] = value;
    };

    const checkCanvas = () => {
      const canvas = rootRef.current?.querySelector(
        "canvas.hashed-gem",
      ) as HTMLCanvasElement | null;

      if (
        canvas &&
        canvas.width === GEM_IMAGE_RESOLUTION &&
        canvas.height === GEM_IMAGE_RESOLUTION &&
        hasOpaquePixels(canvas)
      ) {
        markReady("1");
        return;
      }

      frameId = window.requestAnimationFrame(checkCanvas);
    };

    frameId = window.requestAnimationFrame(checkCanvas);
    timeoutId = window.setTimeout(() => {
      markReady("error");
    }, RENDER_TIMEOUT_MS);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      delete html.dataset[READY_DATASET_KEY];
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent">
      <div ref={rootRef}>
        <HashedGem
          seed={seed}
          size={GEM_IMAGE_RESOLUTION}
          resolution={GEM_IMAGE_RESOLUTION}
          static
        />
      </div>
    </main>
  );
}
