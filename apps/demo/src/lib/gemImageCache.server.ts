import "server-only";

import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { GEM_IMAGE_RESOLUTION } from "@/lib/gemImage";
import {
  getDefaultChromiumPackUrl,
  getGemImageBlobPath,
  getGemImageObjectCacheControl,
  getGemImageRendererVersion,
  getGemRenderUrl,
  getLocalChromeExecutablePath,
} from "@/lib/gemImage.server";
import { getR2Object, putR2Object } from "@/lib/r2.server";

async function renderGemPng(renderUrl: string): Promise<ArrayBuffer> {
  const isProduction =
    process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  const localChromePath = isProduction ? null : getLocalChromeExecutablePath();

  const launchOptions = localChromePath
    ? {
        args: puppeteer.defaultArgs(),
        executablePath: localChromePath,
        headless: true as const,
      }
    : {
        args: puppeteer.defaultArgs({
          args: chromium.args,
          headless: "shell",
        }),
        executablePath: await chromium.executablePath(
          process.env.CHROMIUM_PACK_URL ?? getDefaultChromiumPackUrl(),
        ),
        headless: "shell" as const,
      };

  const browser = await puppeteer.launch({
    ...launchOptions,
    defaultViewport: {
      width: GEM_IMAGE_RESOLUTION,
      height: GEM_IMAGE_RESOLUTION,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    },
  });

  try {
    const page = await browser.newPage();
    await page.goto(renderUrl, { waitUntil: "domcontentloaded" });

    const readyHandle = await page.waitForFunction(
      () => {
        const ready = document.documentElement.dataset.gemReady;
        return ready === "1" || ready === "error" ? ready : false;
      },
      { timeout: 15_000 },
    );

    const readyState = (await readyHandle.jsonValue()) as string;

    if (readyState !== "1") {
      throw new Error("Gem render did not become ready");
    }

    const dataUrl = await page.$eval("canvas.hashed-gem", (canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Gem canvas not found");
      }

      return canvas.toDataURL("image/png");
    });

    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
  } finally {
    await Promise.race([
      browser.close(),
      browser.close(),
      browser.close(),
    ]).catch(() => {});
  }
}

export async function getCachedGemImage(
  seed: string,
): Promise<ArrayBuffer | null> {
  const rendererVersion = getGemImageRendererVersion();
  const objectKey = getGemImageBlobPath(seed, rendererVersion);
  return getR2Object(objectKey);
}

export async function getOrCreateGemImage(
  origin: string,
  seed: string,
): Promise<ArrayBuffer> {
  const rendererVersion = getGemImageRendererVersion();
  const objectKey = getGemImageBlobPath(seed, rendererVersion);
  const cachedImage = await getR2Object(objectKey);

  if (cachedImage) {
    return cachedImage;
  }

  const pngBytes = await renderGemPng(getGemRenderUrl(origin, seed));
  await putR2Object({
    key: objectKey,
    body: pngBytes,
    contentType: "image/png",
    cacheControl: getGemImageObjectCacheControl(),
  });

  return pngBytes;
}
