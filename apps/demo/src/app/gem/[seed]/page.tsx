import { HashedGem, getGemProperties } from "@m3000/hashed-gems";
import type { Metadata } from "next";
import { RARITY_BADGE } from "@/lib/gemStyles";
import { GemPageShareButtons } from "./GemPageShareButtons";

type Props = { params: Promise<{ seed: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seed: raw } = await params;
  const seed = decodeURIComponent(raw);
  const { gemTypeName, rarityName } = getGemProperties(seed);

  return {
    title: `${rarityName} ${gemTypeName} — hashed-gems`,
    description: `${seed}'s gem is a ${rarityName} ${gemTypeName}. What's yours?`,
    openGraph: {
      title: `${rarityName} ${gemTypeName}`,
      description: `${seed}'s gem is a ${rarityName} ${gemTypeName}. What's yours? 💎`,
      images: [{ url: `/gem/${raw}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${rarityName} ${gemTypeName}`,
      description: `${seed}'s gem is a ${rarityName} ${gemTypeName}. What's yours? 💎`,
      images: [`/gem/${raw}/opengraph-image`],
    },
  };
}

export default async function GemPage({ params }: Props) {
  const { seed: raw } = await params;
  const seed = decodeURIComponent(raw);
  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <a
        href="/"
        className="mb-12 text-sm text-neutral-500 transition-colors hover:text-neutral-800 dark:hover:text-neutral-300"
      >
        ← Back
      </a>

      <div className="mb-6 overflow-hidden rounded-full">
        <HashedGem seed={seed} size={160} />
      </div>

      <h1 className="mb-4 max-w-sm text-center text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
        {seed}
      </h1>

      <div className="mb-8 flex flex-wrap justify-center gap-1.5">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${RARITY_BADGE[rarityName]}`}
        >
          {rarityName}
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {gemTypeName}
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500">
          {cutTypeName} cut
        </span>
      </div>

      <GemPageShareButtons
        seed={seed}
        gemTypeName={gemTypeName}
        rarityName={rarityName}
      />

      <a
        href="/"
        className="mt-12 text-sm text-neutral-400 transition-colors hover:text-neutral-600 hover:underline dark:hover:text-neutral-300"
      >
        Generate your own gem →
      </a>
    </main>
  );
}
