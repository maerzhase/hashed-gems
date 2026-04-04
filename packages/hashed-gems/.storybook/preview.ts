import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import "./preview.css";

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "dark",
      parentSelector: "html",
    }),
  ],
  initialGlobals: {
    theme: "dark",
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: { disable: true },
  },
};

export default preview;
