import chromium from "@sparticuz/chromium-min";
import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import {
  GEM_IMAGE_RESOLUTION,
  decodeGemSeed,
  isValidGemSeed,
} from "@/lib/gemImage";
import {
  GEM_IMAGE_BLOB_CACHE_MAX_AGE,
  getDefaultChromiumPackUrl,
  getGemImageBlobPath,
  getGemImageRedirectHeaders,
  getGemImageRendererVersion,
  getLocalChromeExecutablePath,
  getGemRenderUrl,
} from "@/lib/gemImage.server";

export const runtime = "nodejs";
export const maxDuration = 60;

function redirectTo(url: string): NextResponse {
  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: url,
      ...getGemImageRedirectHeaders(),
    },
  });
}

async function findExistingGemImage(pathname: string): Promise<string | null> {
  try {
    const blob = await get(pathname, { access: "public" });
    return blob?.blob.url ?? null;
  } catch {
    return null;
  }
}

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ seed: string }> },
) {
  const { seed: raw } = await params;
  const seed = decodeGemSeed(raw);

  if (!isValidGemSeed(seed)) {
    return NextResponse.json({ error: "Invalid seed" }, { status: 400 });
  }

  const rendererVersion = getGemImageRendererVersion();
  const blobPath = getGemImageBlobPath(seed, rendererVersion);
  const existingUrl = await findExistingGemImage(blobPath);

  if (existingUrl) {
    return redirectTo(existingUrl);
  }

  const origin = new URL(request.url).origin;
  const pngBytes = await renderGemPng(getGemRenderUrl(origin, seed));
  const blob = await put(
    blobPath,
    new Blob([pngBytes], { type: "image/png" }),
    {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: GEM_IMAGE_BLOB_CACHE_MAX_AGE,
    },
  );

  return redirectTo(blob.url);
}
