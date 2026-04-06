import { cache } from "react";
import type { BundledLanguage } from "shiki";
import { createHighlighter } from "shiki";

const SHIKI_THEMES = {
  light: "github-light",
  dark: "github-dark",
} as const;

const highlighterPromise = createHighlighter({
  themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark],
  langs: ["bash", "tsx"],
});

export const highlightCode = cache(
  async (code: string, lang: BundledLanguage) => {
    const highlighter = await highlighterPromise;

    return highlighter.codeToHtml(code, {
      lang,
      themes: SHIKI_THEMES,
      defaultColor: false,
      transformers: [
        {
          pre(node) {
            delete node.properties.tabindex;
            node.properties.class = [
              ...(Array.isArray(node.properties.class)
                ? node.properties.class
                : []),
              "shiki-code",
            ];
          },
        },
      ],
    });
  },
);
