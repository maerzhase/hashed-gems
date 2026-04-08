"use client";

import { HashedGem } from "@m3000/hashed-gems";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { GemGenerator } from "@/components/GemGenerator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTab } from "@/components/ui/Tabs";

interface PackageManager {
  id: string;
  label: string;
  command: string;
}

interface InstallSectionProps {
  packageManagers: readonly PackageManager[];
}

interface CopyCodeButtonProps extends ComponentProps<typeof Button> {
  text: string;
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, key = "default") => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 2000);
  };

  const isCopied = (key = "default") => copiedKey === key;

  return { copy, isCopied };
}

export function HeroGemButton() {
  const [seed, setSeed] = useState("hashed-gems");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const nextProgress = Math.min(window.scrollY / 320, 1);
      setScrollProgress(nextProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  const backgroundOpacity = 0.045 + scrollProgress * 0.095;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-[8vh] left-1/2 -translate-x-1/2 blur-3xl saturate-125 transition-opacity duration-300 ease-out"
          style={{ opacity: backgroundOpacity }}
        >
          <HashedGem seed={seed} size={680} resolution={1280} aria-hidden />
        </div>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950/16 blur-2xl dark:bg-black/45"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setSeed(Math.random().toString(36).slice(2))}
          className="relative z-10 cursor-pointer transition-transform hover:scale-105 focus-visible:outline-none focus-visible:[&_.hashed-gem-container]:ring-2 focus-visible:[&_.hashed-gem-container]:ring-black/60 focus-visible:[&_.hashed-gem-container]:ring-offset-2 focus-visible:[&_.hashed-gem-container]:ring-offset-neutral-50 dark:focus-visible:[&_.hashed-gem-container]:ring-white/60 dark:focus-visible:[&_.hashed-gem-container]:ring-offset-neutral-950"
          aria-label="Generate a random gem"
        >
          <HashedGem seed={seed} size={96} resolution={512} />
        </button>
      </div>
    </>
  );
}

export function GeneratorSection() {
  const [generatorInput, setGeneratorInput] = useState("");
  const generatorSeed = generatorInput.trim();

  return (
    <Card>
      <Input
        value={generatorInput}
        onChange={(e) => setGeneratorInput(e.target.value)}
        placeholder="Type your name…"
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
  );
}

export function InstallSection({ packageManagers }: InstallSectionProps) {
  const [selectedPm, setSelectedPm] = useState(packageManagers[0]?.id ?? "");
  const { copy, isCopied } = useCopy();

  const currentCommand =
    packageManagers.find((pm) => pm.id === selectedPm)?.command ?? "";

  return (
    <Card className="mb-16">
      <Tabs
        value={selectedPm}
        onValueChange={(value) => setSelectedPm(String(value))}
      >
        <TabsList>
          {packageManagers.map((pm) => (
            <TabsTab key={pm.id} value={pm.id}>
              {pm.label}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      <Button
        onClick={() => copy(currentCommand, "install")}
        variant="ghost"
        className="group w-full"
      >
        <span className="text-neutral-500 dark:text-neutral-500">$</span>
        <span className="flex-1 text-left font-mono text-sm text-neutral-800 dark:text-neutral-300">
          {currentCommand}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            isCopied("install")
              ? "bg-neutral-600 text-white dark:bg-neutral-600 dark:text-white"
              : "bg-neutral-200 text-neutral-700 group-hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:group-hover:bg-neutral-600"
          }`}
        >
          {isCopied("install") ? "copied!" : "copy"}
        </span>
      </Button>
    </Card>
  );
}

export function CopyCodeButton({
  text,
  children,
  ...props
}: CopyCodeButtonProps) {
  const { copy, isCopied } = useCopy();
  const copyKey = props["aria-label"] ?? text;

  return (
    <Button onClick={() => copy(text, copyKey)} {...props}>
      {isCopied(copyKey) ? "copied!" : children}
    </Button>
  );
}
