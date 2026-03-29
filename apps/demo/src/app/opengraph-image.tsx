import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Hashed Gems - Deterministic gemstone avatars";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const imageData = await readFile(join(process.cwd(), "src/public/gem01.png"));
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
          fontSize: 64,
          fontFamily: "Inter",
          fontWeight: 600,
          position: "absolute",
          bottom: 160,
        }}
      >
        Your users are gems. Show it.
      </div>
      <div
        style={{
          color: "#a3a3a3",
          fontSize: 28,
          fontFamily: "Inter",
          position: "absolute",
          bottom: 100,
        }}
      >
        Deterministic gemstone avatars generated from any string.
      </div>
      <div
        style={{
          color: "#525252",
          fontSize: 20,
          fontFamily: "Inter",
          position: "absolute",
          bottom: 50,
        }}
      >
        gems.m3000.io
      </div>
    </div>,
    {
      ...size,
    },
  );
}
