"use client";

import { IconBrandGithub, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-10 flex gap-2">
      <IconButton
        render={(props) => (
          <a
            {...props}
            href="https://github.com/maerzhase/hashed-gems"
            target="_blank"
            rel="noopener noreferrer"
          />
        )}
        nativeButton={false}
        aria-label="GitHub repository"
      >
        <IconBrandGithub size={16} />
      </IconButton>
      <IconButton
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={
          mounted && theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
      >
        {!mounted || theme === "dark" ? (
          <IconSun size={16} />
        ) : (
          <IconMoon size={16} />
        )}
      </IconButton>
    </div>
  );
}
