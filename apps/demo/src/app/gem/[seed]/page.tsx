import type { Rarity } from "@m3000/hashed-gems";
import {
  getCutVariant,
  getCutVariantLabel,
  getGemProperties,
} from "@m3000/hashed-gems";
import type { Metadata } from "next";
import { GemPageContent } from "./GemPageContent";

type Props = { params: Promise<{ seed: string }> };

async function getSeedData(params: Promise<{ seed: string }>) {
  const { seed: raw } = await params;
  const seed = decodeURIComponent(raw);
  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);
  const cutVariantName = getCutVariantLabel(getCutVariant(seed, cutTypeName));

  return { seed, gemTypeName, cutTypeName, cutVariantName, rarityName };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seed, gemTypeName, rarityName } = await getSeedData(params);
  const canonicalPath = `/gem/${encodeURIComponent(seed)}`;
  const metaTitle = `${seed} — ${rarityName} ${gemTypeName} — hashed-gems`;
  const socialTitle = `${seed} — ${rarityName} ${gemTypeName}`;
  const metaDescription = `${seed}'s gem is a ${rarityName} ${gemTypeName}. What's yours?`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: socialTitle,
      description: `${metaDescription} 💎`,
      url: canonicalPath,
      images: [
        {
          url: `${canonicalPath}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: `${metaDescription} 💎`,
      images: [`/gem/${encodeURIComponent(seed)}/opengraph-image`],
    },
  };
}

export default async function GemPage({ params }: Props) {
  const { seed, gemTypeName, cutTypeName, cutVariantName, rarityName } =
    await getSeedData(params);

  return (
    <GemPageContent
      seed={seed}
      gemTypeName={gemTypeName}
      cutTypeName={cutTypeName}
      cutVariantName={cutVariantName}
      rarityName={rarityName as Rarity}
    />
  );
}
