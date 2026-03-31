"use client";

import type { Rarity } from "@m3000/hashed-gems";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { GemPageClient } from "./GemPageClient";

interface Props {
  seed: string;
  gemTypeName: string;
  cutTypeName: string;
  cutVariantName: string;
  rarityName: Rarity;
}

export function GemPageContent({
  seed,
  gemTypeName,
  cutTypeName,
  cutVariantName,
  rarityName,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center px-6">
      <SiteHeader />

      <div className="flex flex-1 flex-col items-center justify-center py-24">
        <h1 className="mb-8 max-w-sm text-center text-2xl tracking-tight text-neutral-900 dark:text-neutral-100">
          <span className="text-xl text-neutral-400 dark:text-neutral-600">
            @
          </span>
          {seed}
        </h1>

        <GemPageClient
          seed={seed}
          gemTypeName={gemTypeName}
          cutTypeName={cutTypeName}
          cutVariantName={cutVariantName}
          rarityName={rarityName}
        />

        <a
          href="/"
          className="mt-12 text-sm text-neutral-400 transition-colors hover:text-neutral-600 hover:underline dark:hover:text-neutral-300"
        >
          Generate your own gem →
        </a>
      </div>

      <SiteFooter />
    </main>
  );
}
