"use client";

import { IconBrandGithub, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
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
  );
}
