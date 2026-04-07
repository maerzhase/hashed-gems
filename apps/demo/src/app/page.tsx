import { CUT_TYPES, HashedGem } from "@m3000/hashed-gems";
import type { BundledLanguage } from "shiki";
import {
  CopyCodeButton,
  GeneratorSection,
  HeroGemButton,
  InstallSection,
} from "@/components/HomePageClient";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { UserBadge } from "@/components/ui/UserBadge";
import { highlightCode } from "@/lib/codeHighlight.server";
import { DEMO_USERS } from "@/lib/demoUsers";

const BASE_URL = "https://gems.m3000.io";
const CUT_TYPE_OPTIONS = `${CUT_TYPES.slice(0, -1).join(", ")}, or ${CUT_TYPES[CUT_TYPES.length - 1]}`;

interface Example {
  label: string;
  description: string;
  code: string;
  lang: BundledLanguage;
  seed: string;
  size?: number;
  resolution?: number;
  static?: boolean;
  gemType?: "emerald";
  cutType?: "rose";
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: true;
}

interface ApiExample {
  label: string;
  description: string;
  code: string;
  lang: BundledLanguage;
}

interface HighlightedExample extends Example {
  html: string;
}

interface HighlightedApiExample extends ApiExample {
  html: string;
}

const EXAMPLES: Example[] = [
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
  {
    label: "Accessibility",
    description:
      "Use aria-label when the gem should stand alone semantically, or aria-hidden when nearby text already identifies the user.",
    code: `import "@m3000/hashed-gems/styles.css";
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="ada.lovelace" aria-label="Avatar for Ada Lovelace" />

<div>
  <HashedGem seed="ada.lovelace" aria-hidden={true} />
  <span>Ada Lovelace</span>
</div>`,
    lang: "tsx",
    seed: "ada.lovelace",
    "aria-label": "Avatar for Ada Lovelace",
  },
];

const API_EXAMPLES: ApiExample[] = [
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

const PACKAGE_MANAGERS = [
  { id: "pnpm", label: "pnpm", command: "pnpm add @m3000/hashed-gems" },
  { id: "npm", label: "npm", command: "npm install @m3000/hashed-gems" },
  { id: "yarn", label: "yarn", command: "yarn add @m3000/hashed-gems" },
  { id: "bun", label: "bun", command: "bun add @m3000/hashed-gems" },
];

export default async function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "@m3000/hashed-gems",
        description: "Deterministic gemstone avatars. Infinitely shimmering.",
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${BASE_URL}/#software`,
        name: "@m3000/hashed-gems",
        description:
          "A React package for deterministic gemstone avatars with a hosted PNG API.",
        codeRepository: "https://github.com/maerzhase/hashed-gems",
        programmingLanguage: "TypeScript",
        runtimePlatform: "React",
        url: BASE_URL,
      },
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/#webpage`,
        url: BASE_URL,
        name: "@m3000/hashed-gems",
        isPartOf: {
          "@id": `${BASE_URL}/#website`,
        },
        about: {
          "@id": `${BASE_URL}/#software`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${BASE_URL}/opengraph-image`,
        },
      },
    ],
  };

  const highlightedExamples: HighlightedExample[] = await Promise.all(
    EXAMPLES.map(
      async (example): Promise<HighlightedExample> => ({
        ...example,
        html: await highlightCode(example.code, example.lang),
      }),
    ),
  );

  const highlightedApiExamples: HighlightedApiExample[] = await Promise.all(
    API_EXAMPLES.map(
      async (example): Promise<HighlightedApiExample> => ({
        ...example,
        html: await highlightCode(example.code, example.lang),
      }),
    ),
  );

  return (
    <main className="min-h-screen">
      <JsonLd data={jsonLd} />
      <SiteHeader />

      <section className="flex flex-col items-center px-6 pt-24 pb-12 md:pt-36">
        <div className="mb-10">
          <HeroGemButton />
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
          <GeneratorSection />
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
          <InstallSection packageManagers={PACKAGE_MANAGERS} />

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
            {highlightedExamples.map((example) => (
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
                      aria-label={example["aria-label"]}
                      aria-hidden={example["aria-hidden"]}
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
                    <CopyCodeButton
                      text={example.code}
                      variant="subtle"
                      className="absolute top-0 right-0"
                    >
                      copy
                    </CopyCodeButton>
                    <div className="overflow-x-auto pr-16 [&_code]:font-mono [&_code]:text-xs [&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:p-0">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: example.html,
                        }}
                      />
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
            {highlightedApiExamples.map((example) => (
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
                    <CopyCodeButton
                      text={example.code}
                      variant="subtle"
                      className="absolute top-0 right-0"
                    >
                      copy
                    </CopyCodeButton>
                    <div className="overflow-x-auto pr-16 [&_code]:font-mono [&_code]:text-xs [&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:p-0">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: example.html,
                        }}
                      />
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
