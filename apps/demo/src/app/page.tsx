"use client";

import { HashedGem } from "@m3000/hashed-gems";
import { GemGenerator } from "@/components/GemGenerator";
import {
  IconBrandGithub,
  IconHandLoveYou,
  IconHeart,
  IconHeartFilled,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
      "Control the gem dimensions with the size prop. Default is 64px.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="bob" size={48} />`,
    seed: "bob",
    size: 48,
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
      "Select from 4 different gem cuts — round-brilliant, princess, cushion, or emerald-step.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="eve" cutType="cushion" />`,
    seed: "eve",
    cutType: "cushion" as const,
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        <a
          href="https://github.com/maerzhase/hashed-gems"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <IconBrandGithub className="h-5 w-5" />
        </a>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={
            mounted && theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {!mounted || theme === "dark" ? (
            <IconSun className="h-5 w-5" />
          ) : (
            <IconMoon className="h-5 w-5" />
          )}
        </button>
      </div>

      <section className="flex flex-col items-center px-6 py-32 md:py-48">
        <button
          type="button"
          onClick={() => setSeed(Math.random().toString(36).slice(2))}
          className="mb-8 cursor-pointer rounded-full transition-transform outline-none hover:scale-110"
        >
          <HashedGem seed={seed} size={64} />
        </button>
        <h1 className="mb-3 text-center font-sans text-2xl font-medium tracking-tight md:text-3xl">
          Your users are gems. Show it.
        </h1>
        <p className="mb-8 max-w-xl text-center text-sm text-neutral-500 md:text-base">
          Deterministic gemstone avatars, uniquely yours — infinitely
          shimmering.
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
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

        <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex border-b border-neutral-200 dark:border-neutral-800">
            {PACKAGE_MANAGERS.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setSelectedPm(pm.id)}
                className={`flex-1 cursor-pointer px-4 py-2.5 font-mono text-xs transition-colors ${
                  selectedPm === pm.id
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
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                copied
                  ? "bg-neutral-600 text-white dark:bg-neutral-600 dark:text-white"
                  : "bg-neutral-200 text-neutral-700 group-hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:group-hover:bg-neutral-600"
              }`}
            >
              {copied ? "copied!" : "copy"}
            </span>
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <h2 className="mb-6 font-sans text-sm font-medium tracking-wider text-neutral-500 uppercase">
          Usage
        </h2>
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
                    size={example.size}
                    static={example.static}
                    gemType={example.gemType}
                    cutType={example.cutType}
                    {...(example.className && { className: example.className })}
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
              <div className="relative p-4 [&_code]:font-mono [&_code]:text-xs [&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:p-0">
                <button
                  type="button"
                  onClick={() => copyExample(example.code, example.label)}
                  className="absolute top-2 right-2 cursor-pointer rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-700 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                >
                  {copiedExample === example.label ? "copied!" : "copy"}
                </button>
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
          ))}
        </div>
      </section>

      <footer className="py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            build with <IconHeartFilled size="16" /> by{" "}
          </span>
          <a
            href="https://m3000.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300"
          >
            m3000.io
          </a>
          <span>·</span>
          <a
            href="https://github.com/maerzhase/hashed-gems"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300"
          >
            <IconBrandGithub className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
