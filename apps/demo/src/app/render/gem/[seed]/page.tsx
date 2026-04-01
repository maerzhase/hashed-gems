import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeGemSeed, isValidGemSeed } from "@/lib/gemImage";
import { GemImageRenderClient } from "./GemImageRenderClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GemImageRenderPage({
  params,
}: {
  params: Promise<{ seed: string }>;
}) {
  const { seed: raw } = await params;
  const seed = decodeGemSeed(raw);

  if (!isValidGemSeed(seed)) {
    notFound();
  }

  return <GemImageRenderClient seed={seed} />;
}
