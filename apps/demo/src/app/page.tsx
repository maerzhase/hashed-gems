"use client";

import { HashedGem } from "@m3000/hashed-gems";
import { useState } from "react";

const DEMO_USERS = [
  "vitalik.eth",
  "satoshi",
  "cz_binance",
  "elonmusk",
  "beeple",
  "gavin_andresen",
  "wolf",
  "cryptopunk_5217",
  "nft_collector",
  "defi_whale",
  "0x7a25...f3c9",
  "diamond_hands",
];

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    await navigator.clipboard.writeText("pnpm add @m3000/hashed-gems");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen">
      <section className="flex flex-col items-center justify-center px-6 py-24 md:py-32">
        <div className="mb-8">
          <HashedGem seed="hashed-gems" size={120} />
        </div>
        <h1 className="mb-4 text-center font-sans text-5xl font-bold tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            @m3000/hashed-gems
          </span>
        </h1>
        <p className="mb-10 max-w-xl text-center text-lg text-zinc-400 md:text-xl">
          Generative gem avatars rendered with WebGL shaders. Each gem is
          uniquely derived from any string — usernames, addresses, or IDs.
        </p>
        <button
          type="button"
          onClick={copyInstall}
          className="group flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/50 px-5 py-3 font-mono text-sm transition-all hover:border-zinc-500 hover:bg-zinc-800/50"
        >
          <span className="text-zinc-400">$</span>
          <span>pnpm add @m3000/hashed-gems</span>
          <span className="ml-2 rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300 transition-colors group-hover:bg-zinc-600">
            {copied ? "copied!" : "copy"}
          </span>
        </button>
      </section>

      <section className="px-6 pb-24">
        <h2 className="mb-8 text-center font-sans text-2xl font-semibold text-zinc-300">
          Gem Gallery
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
          {DEMO_USERS.map((user) => (
            <div key={user} className="flex flex-col items-center gap-2">
              <HashedGem seed={user} size={80} />
              <span className="max-w-full truncate font-mono text-xs text-zinc-500">
                {user}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <h2 className="mb-6 font-sans text-2xl font-semibold text-zinc-300">
          Usage
        </h2>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <pre className="font-mono text-sm text-zinc-300">
            <code>{`import { HashedGem } from "@m3000/hashed-gems";
import "@m3000/hashed-gems/styles.css";

<HashedGem seed="vitalik.eth" />
<HashedGem seed="0x..." size={128} />`}</code>
          </pre>
        </div>
      </section>
    </main>
  );
}
