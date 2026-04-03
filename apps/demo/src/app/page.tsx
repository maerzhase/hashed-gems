"use client";

import { CUT_TYPES, HashedGem } from "@m3000/hashed-gems";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { GemGenerator } from "@/components/GemGenerator";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTab } from "@/components/ui/Tabs";
import { GemButton } from "@/components/ui/GemButton";
import { UserBadge } from "@/components/ui/UserBadge";

const CUT_TYPE_OPTIONS = `${CUT_TYPES.slice(0, -1).join(", ")}, or ${CUT_TYPES[CUT_TYPES.length - 1]}`;

const EXAMPLES = [
  {
    label: "Basic usage",
    description:
      "The only required prop is seed — any string produces a unique, deterministic gem.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="alice" />`,
    lang: "tsx",
    seed: "alice",
  },
  {
    label: "Size",
    description:
      "size sets the CSS display size in pixels. Default is 64px. Internally the gem renders at size × devicePixelRatio for crisp results on retina screens.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="bob" size={48} />`,
    lang: "tsx",
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
    lang: "tsx",
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
    lang: "tsx",
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
    lang: "tsx",
    seed: "dave",
    gemType: "emerald" as const,
  },
  {
    label: "Cut type",
    description: `Select from ${CUT_TYPES.length} different gem cuts - ${CUT_TYPE_OPTIONS}.`,
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="eve" cutType="rose" />`,
    lang: "tsx",
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
    lang: "tsx",
    seed: "hashed-gem",
    className: "rounded-full border border-neutral-500 shadow-lg",
  },
];

const API_EXAMPLES = [
  {
    label: "Direct image URL",
    description:
      "Request the canonical gem PNG for any seed. The API always resolves to a fixed 512x512 image.",
    code: `GET https://gems.m3000.io/api/gems/marina`,
    lang: "bash",
  },
  {
    label: "Use in HTML",
    description:
      "Drop the endpoint straight into an img tag when you want a stable avatar URL for profiles, tables, or comments.",
    code: `<img
  src="https://gems.m3000.io/api/gems/marina"
  alt="marina gem"
  width="64"
  height="64"
/>`,
    lang: "tsx",
  },
  {
    label: "Use in React",
    description:
      "The endpoint works well as a static asset layer when the consumer does not need the live WebGL component.",
    code: `function UserAvatar({ seed }: { seed: string }) {
  return (
    <img
      src={\`https://gems.m3000.io/api/gems/\${encodeURIComponent(seed)}\`}
      alt={\`\${seed} gem\`}
      width={64}
      height={64}
    />
  );
}`,
    lang: "tsx",
  },
];

const DEMO_USERS = [
  "bob",
  "hannah",
  "laura",
  "rachel",
  "victor",
  "wendy",
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
        langs: ["bash", "tsx"],
      });
      const highlighted: Record<string, string> = {};
      for (const example of [...EXAMPLES, ...API_EXAMPLES]) {
        highlighted[example.label] = highlighter.codeToHtml(example.code, {
          lang: example.lang,
          theme: theme === "dark" ? "github-dark" : "github-light",
          transformers: [
            {
              pre(node) {
                delete node.properties.tabindex;
              },
            },
          ],
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
        <div className="mb-10">
          <GemButton
            seed={seed}
            size={96}
            resolution={512}
            onClick={() => setSeed(Math.random().toString(36).slice(2))}
          />
        </div>
        <h1 className="mb-3 text-center font-sans text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
          Your users are gems. Show it.
        </h1>
        <p className="mb-8 max-w-xl text-center text-sm text-neutral-500 md:text-base">
          Deterministic gemstone avatars. Infinitely shimmering.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {DEMO_USERS.map((user) => (
            <UserBadge key={user} user={user} />
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-6 flex items-center gap-2 font-sans text-sm tracking-wider text-neutral-900 uppercase dark:text-white">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"
              aria-hidden="true"
            />
            Create your own gem
          </h2>
          <Card>
            <Input
              value={generatorInput}
              onChange={(e) => setGeneratorInput(e.target.value)}
              placeholder="What's your gem? Type your name…"
              autoComplete="off"
              data-1p-ignore
              maxLength={100}
            />
            {generatorSeed && (
              <>
                <div className="border-t border-neutral-100 dark:border-neutral-800" />
                <GemGenerator seed={generatorSeed} />
              </>
            )}
          </Card>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-3 flex items-center gap-2 font-sans text-sm tracking-wider text-neutral-900 uppercase dark:text-white">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"
              aria-hidden="true"
            />
            Installation
          </h2>
          <p className="mb-6 text-sm text-neutral-500">
            Install with your favourite package manager.
          </p>
          <Card className="mb-16">
            <Tabs
              value={selectedPm}
              onValueChange={(value) => setSelectedPm(String(value))}
            >
              <TabsList>
                {PACKAGE_MANAGERS.map((pm) => (
                  <TabsTab key={pm.id} value={pm.id}>
                    {pm.label}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
            <Button
              onClick={copyInstall}
              variant="ghost"
              className="group w-full"
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
            </Button>
          </Card>

          <h2 className="mb-3 flex items-center gap-2 font-sans text-sm tracking-wider text-neutral-900 uppercase dark:text-white">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"
              aria-hidden="true"
            />
            Usage
          </h2>
          <p className="mb-6 text-sm text-neutral-500">
            Import the component and pass any string as a seed.
          </p>
          <div className="flex flex-col gap-6">
            {EXAMPLES.map((example) => (
              <Card key={example.label}>
                <CardHeader className="flex min-w-0 items-center py-2">
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
                  <div className="ml-4 flex flex-col justify-center gap-1">
                    <span className="font-medium leading-5 text-neutral-900 dark:text-neutral-100">
                      {example.label}
                    </span>
                    <span className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                      {example.description}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      onClick={() => copyExample(example.code, example.label)}
                      variant="subtle"
                      className="absolute top-0 right-0"
                    >
                      {copiedExample === example.label ? "copied!" : "copy"}
                    </Button>
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
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="mt-16 mb-3 flex items-center gap-2 font-sans text-sm tracking-wider text-neutral-900 uppercase dark:text-white">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"
              aria-hidden="true"
            />
            Image API
          </h2>
          <p className="mb-6 text-sm text-neutral-500">
            Use the hosted PNG API when you want a static gem image instead of
            the live WebGL component. Each seed resolves to one canonical
            `512x512` image.
          </p>
          <div className="flex flex-col gap-6">
            {API_EXAMPLES.map((example) => (
              <Card key={example.label}>
                <CardHeader>
                  <span className="block leading-5 font-medium text-neutral-900 dark:text-neutral-100">
                    {example.label}
                  </span>
                  <span className="block pt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                    {example.description}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      onClick={() => copyExample(example.code, example.label)}
                      variant="subtle"
                      className="absolute top-0 right-0"
                    >
                      {copiedExample === example.label ? "copied!" : "copy"}
                    </Button>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
