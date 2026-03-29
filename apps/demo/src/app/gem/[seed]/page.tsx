import type { Rarity } from "@m3000/hashed-gems";
import { getGemProperties } from "@m3000/hashed-gems";
import type { Metadata } from "next";
import { GemPageContent } from "./GemPageContent";

type Props = { params: Promise<{ seed: string }> };

async function getSeedData(params: Promise<{ seed: string }>) {
  const { seed: raw } = await params;
  const seed = decodeURIComponent(raw);
  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);
  return { seed, gemTypeName, cutTypeName, rarityName };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seed, gemTypeName, rarityName } = await getSeedData(params);

  return {
    title: `${rarityName} ${gemTypeName} — hashed-gems`,
    description: `${seed}'s gem is a ${rarityName} ${gemTypeName}. What's yours?`,
    openGraph: {
      title: `${rarityName} ${gemTypeName}`,
      description: `${seed}'s gem is a ${rarityName} ${gemTypeName}. What's yours? 💎`,
      images: [
        {
          url: `/gem/${encodeURIComponent(seed)}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${rarityName} ${gemTypeName}`,
      description: `${seed}'s gem is a ${rarityName} ${gemTypeName}. What's yours? 💎`,
      images: [`/gem/${encodeURIComponent(seed)}/opengraph-image`],
    },
  };
}

export default async function GemPage({ params }: Props) {
  const { seed, gemTypeName, cutTypeName, rarityName } =
    await getSeedData(params);

  return (
    <GemPageContent
      seed={seed}
      gemTypeName={gemTypeName}
      cutTypeName={cutTypeName}
      rarityName={rarityName as Rarity}
    />
  );
}
