import type { Components } from "react-markdown";
import type { Theme } from "@/lib/theme";
import { themes } from "@/lib/theme";

export function getMarkdownComponents(theme: Theme): Components {
  const themeConfig = themes[theme];
  
  return {
    em: ({ children }: { children?: React.ReactNode }) => (
      <span className={themeConfig.markdownEm}>
        *{children}*
      </span>
    ),
  };
}
