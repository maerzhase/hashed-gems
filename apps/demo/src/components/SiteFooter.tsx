import { IconBrandGithub, IconHeartFilled } from "@tabler/icons-react";

export function SiteFooter() {
  return (
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
  );
}
