"use client";

import { HashedGem } from "@m3000/hashed-gems";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const codeString = `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="alice" />
<HashedGem seed="bob" size={48} />`;

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
  const [highlightedCode, setHighlightedCode] = useState<string>("");
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
      const html = highlighter.codeToHtml(codeString, {
        lang: "tsx",
        theme: theme === "dark" ? "github-dark" : "github-light",
      });
      setHighlightedCode(html);
    });
  }, [theme]);

  const currentCommand =
    PACKAGE_MANAGERS.find((pm) => pm.id === selectedPm)?.command ?? "";

  const copyInstall = async () => {
    await navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen">
      <div className="fixed top-4 right-4 z-10">
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
          {!mounted ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : theme === "dark" ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
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
        <p className="mb-8 max-w-md text-center text-sm text-neutral-500 md:text-base">
          Deterministic gemstone avatars generated from any string.
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

      <section className="mx-auto max-w-xl px-6 pb-24">
        <h2 className="mb-6 font-sans text-sm font-medium tracking-wider text-neutral-500 uppercase">
          Usage
        </h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50 [&_code]:font-mono [&_code]:text-xs [&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:p-0">
          {highlightedCode ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          ) : (
            <pre className="font-mono text-xs text-neutral-500">Loading...</pre>
          )}
        </div>
      </section>
    </main>
  );
}
