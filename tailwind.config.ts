import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        body: ["var(--font-geist-sans)", "sans-serif"],
      },
      textShadow: {
        "green-glow": "0 0 10px rgba(34, 197, 94, 0.3)",
      },
      /* Typography: proportional scale by function (~1.2 ratio)
       * Display 2xl | H1 xl | H2 lg | Body base | Caption sm | Overline xs */
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.5rem" }],
        xl: ["1.25rem", { lineHeight: "1.5rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.5rem" }],
      },
      colors: {
        "terminal-green": "#22c55e",
        "terminal-dark": "#0a0a0a",
        "retro-bg": "#020617",
        "navy-dark": "#020617",
        "springpod-green": "#22C55E",
        "stellar-cyan": "#0EA5E9",
        "alert-amber": "#F59E0B",
        "terminal-slate": "#64748B",
      },
      boxShadow: {
        "green-glow": "0 0 15px rgba(34, 197, 94, 0.4)",
        "neon-green": "0 0 20px rgba(34, 197, 94, 0.4)",
        "amber-glow": "0 0 12px rgba(245, 158, 11, 0.5)",
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
