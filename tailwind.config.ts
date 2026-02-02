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
        heading: ["var(--font-sans)", "sans-serif"],
        body: ["var(--font-sans)", "sans-serif"],
      },
      // Typography: +2px across scale for better readability
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.375rem", { lineHeight: "1.75rem" }],
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
