"use client";

import { CUT_TYPES, HashedGem } from "@m3000/hashed-gems";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { GemGenerator } from "@/components/GemGenerator";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const CUT_TYPE_OPTIONS = `${CUT_TYPES.slice(0, -1).join(", ")}, or ${CUT_TYPES[CUT_TYPES.length - 1]}`;

const EXAMPLES = [
  {
    label: "Basic usage",
    description:
      "The only required prop is seed — any string produces a unique, deterministic gem.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="alice" />`,
    seed: "alice",
  },
  {
    label: "Size",
    description:
      "size sets the CSS display size in pixels. Default is 64px. Internally the gem renders at size × devicePixelRatio for crisp results on retina screens.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="bob" size={48} />`,
    seed: "bob",
    size: 48,
  },
  {
    label: "Resolution",
    description:
      "Pass resolution to override the WebGL canvas pixel count. Useful when you need a high-quality capture for sharing or exports — display size stays the same.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

// Displays at 96px, renders internally at 512px — sharp capture
<HashedGem seed="frank" size={96} resolution={512} />`,
    seed: "frank",
    size: 96,
    resolution: 512,
  },
  {
    label: "Static mode",
    description:
      "Disable the shimmer animation for improved performance in lists or print contexts.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="carol" static />`,
    seed: "carol",
    static: true,
  },
  {
    label: "Gem type",
    description:
      "Choose from 12 predefined gemstone types — diamond, ruby, sapphire, and more.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="dave" gemType="emerald" />`,
    seed: "dave",
    gemType: "emerald" as const,
  },
  {
    label: "Cut type",
    description:
      `Select from ${CUT_TYPES.length} different gem cuts - ${CUT_TYPE_OPTIONS}.`,
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="eve" cutType="rose" />`,
    seed: "eve",
    cutType: "rose" as const,
  },
  {
    label: "Custom styling",
    description:
      "Apply your own classes for border radius, borders, or shadows.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="hashed-gem" className="rounded-full border border-neutral-500 shadow-lg" />`,
    seed: "hashed-gem",
    className: "rounded-full border border-neutral-500 shadow-lg",
  },
];

const DEMO_USERS = [
  "bob",
  "hannah",
  "laura",
  "rachel",
  "victor",
  "wendy",
  "george",
  "evan",
  "alice",
  "nora",
  "fiona",
  "charlie",
];

const PACKAGE_MANAGERS = [
  { id: "pnpm", label: "pnpm", command: "pnpm add @m3000/hashed-gems" },
  { id: "npm", label: "npm", command: "npm install @m3000/hashed-gems" },
  { id: "yarn", label: "yarn", command: "yarn add @m3000/hashed-gems" },
  { id: "bun", label: "bun", command: "bun add @m3000/hashed-gems" },
];

export default function Home() {
  const [seed, setSeed] = useState("hashed-gems");
  const [selectedPm, setSelectedPm] = useState("pnpm");
  const [copied, setCopied] = useState(false);
  const [generatorInput, setGeneratorInput] = useState("");
  const [generatorSeed, setGeneratorSeed] = useState("");
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [highlightedExamples, setHighlightedExamples] = useState<
    Record<string, string>
  >({});
  const { theme } = useTheme();

  useEffect(() => {
    const t = setTimeout(() => setGeneratorSeed(generatorInput.trim()), 200);
    return () => clearTimeout(t);
  }, [generatorInput]);

  useEffect(() => {
    import("shiki").then(async ({ createHighlighter }) => {
      const highlighter = await createHighlighter({
        themes: ["github-dark", "github-light"],
        langs: ["tsx"],
      });
      const highlighted: Record<string, string> = {};
      for (const example of EXAMPLES) {
        highlighted[example.label] = highlighter.codeToHtml(example.code, {
          lang: "tsx",
          theme: theme === "dark" ? "github-dark" : "github-light",
        });
      }
      setHighlightedExamples(highlighted);
    });
  }, [theme]);

  const currentCommand =
    PACKAGE_MANAGERS.find((pm) => pm.id === selectedPm)?.command ?? "";

  const copyInstall = async () => {
    await navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyExample = async (code: string, label: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedExample(label);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="flex flex-col items-center px-6 pt-24 pb-12 md:pt-36">
        <button
          type="button"
          onClick={() => setSeed(Math.random().toString(36).slice(2))}
          className="mb-8 cursor-pointer rounded-full transition-transform outline-none hover:scale-110"
        >
          <HashedGem seed={seed} size={64} resolution={512} />
        </button>
        <h1 className="mb-3 text-center font-sans text-2xl font-medium tracking-tight text-neutral-900 md:text-3xl dark:text-white">
          Your users are gems. Show it.
        </h1>
        <p className="mb-8 max-w-xl text-center text-sm text-neutral-500 md:text-base">
          Deterministic gemstone avatars, uniquely yours — infinitely
          shimmering.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {DEMO_USERS.map((user) => (
            <div
              key={user}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/80"
            >
              <div className="overflow-hidden rounded-full">
                <HashedGem seed={user} size={24} />
              </div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                @{user}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-6 font-sans text-sm tracking-wider text-neutral-900 uppercase dark:text-white">
            Create your own gem
          </h2>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
            <input
              type="text"
              value={generatorInput}
              onChange={(e) => setGeneratorInput(e.target.value)}
              placeholder="What's your gem? Type your name…"
              autoComplete="off"
              data-1p-ignore
              maxLength={100}
              className="w-full bg-transparent px-4 py-3 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-200 dark:placeholder:text-neutral-600"
            />
            {generatorSeed && (
              <>
                <div className="border-t border-neutral-100 dark:border-neutral-800" />
                <GemGenerator seed={generatorSeed} />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-3 font-sans text-sm tracking-wider text-neutral-900 uppercase dark:text-white">
            Installation
          </h2>
          <p className="mb-6 text-sm text-neutral-500">
            Install with your favourite package manager.
          </p>
          <div className="mb-16 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              {PACKAGE_MANAGERS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setSelectedPm(pm.id)}
                  className={`flex-1 cursor-pointer px-4 py-2.5 font-mono text-xs transition-colors ${selectedPm === pm.id
                    ? "border-b-2 border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200"
                    : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                    }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={copyInstall}
              className="group flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <span className="text-neutral-500 dark:text-neutral-500">$</span>
              <span className="flex-1 text-left font-mono text-sm text-neutral-800 dark:text-neutral-300">
                {currentCommand}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs transition-colors ${copied
                  ? "bg-neutral-600 text-white dark:bg-neutral-600 dark:text-white"
                  : "bg-neutral-200 text-neutral-700 group-hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:group-hover:bg-neutral-600"
                  }`}
              >
                {copied ? "copied!" : "copy"}
              </span>
            </button>
          </div>

          <h2 className="mb-3 font-sans text-sm tracking-wider text-neutral-900 uppercase dark:text-white">
            Usage
          </h2>
          <p className="mb-6 text-sm text-neutral-500">
            Import the component and pass any string as a seed.
          </p>
          <div className="flex flex-col gap-6">
            {EXAMPLES.map((example) => (
              <div
                key={example.label}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50"
              >
                <div className="flex min-w-0 items-center border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="shrink-0">
                    <HashedGem
                      seed={example.seed}
                      size={example.size ?? 64}
                      resolution={example.resolution}
                      static={example.static}
                      gemType={example.gemType}
                      cutType={example.cutType}
                      {...(example.className && {
                        className: example.className,
                      })}
                    />
                  </div>
                  <div className="ml-4 flex flex-col justify-center">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {example.label}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {example.description}
                    </span>
                  </div>
                </div>
                <div className="relative overflow-hidden p-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => copyExample(example.code, example.label)}
                      className="absolute top-0 right-0 cursor-pointer rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-700 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                    >
                      {copiedExample === example.label ? "copied!" : "copy"}
                    </button>
                    <div className="overflow-x-auto pr-16 [&_code]:font-mono [&_code]:text-xs [&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:p-0">
                      {highlightedExamples[example.label] ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: highlightedExamples[example.label],
                          }}
                        />
                      ) : (
                        <pre className="overflow-x-auto font-mono text-xs text-neutral-500">
                          {example.code}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
