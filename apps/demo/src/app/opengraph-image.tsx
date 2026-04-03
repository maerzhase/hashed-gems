import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadInterFont } from "./ogFont";

export const alt =
  "Hashed Gems - Deterministic gemstone avatars. Infinitely shimmering.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const imageData = await readFile(join(process.cwd(), "src/public/gem01.png"));
  const fontText =
    "Your users are gems. Show it. Deterministic gemstone avatars. Infinitely shimmering. gems.m3000.io";
  const [interMedium, interSemibold] = await Promise.all([
    loadInterFont(500, fontText),
    loadInterFont(600, fontText),
  ]);
  const base64 = imageData.toString("base64");
  const dataUrl = `data:image/png;base64,${base64}`;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        position: "relative",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: next/og context, <Image> not available */}
      <img
        src={dataUrl}
        alt="Gem"
        width={200}
        height={200}
        style={{
          position: "absolute",
          top: 100,
        }}
      />
      <div
        style={{
          color: "#ffffff",
          fontSize: 60,
          fontFamily: "Inter",
          fontWeight: 500,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          position: "absolute",
          bottom: 156,
        }}
      >
        Your users are gems. Show it.
      </div>
      <div
        style={{
          color: "#a3a3a3",
          fontSize: 26,
          lineHeight: 1.3,
          fontFamily: "Inter",
          position: "absolute",
          bottom: 98,
        }}
      >
        Deterministic gemstone avatars. Infinitely shimmering.
      </div>
      <div
        style={{
          color: "#525252",
          fontSize: 18,
          letterSpacing: "-0.01em",
          fontFamily: "Inter",
          position: "absolute",
          bottom: 52,
        }}
      >
        gems.m3000.io
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter",
          data: interSemibold,
          style: "normal",
          weight: 600,
        },
      ],
    },
  );
}
