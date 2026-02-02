import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** @type { import("eslint").Linter.FlatConfig[] } */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "vitest.setup.ts",
      "scripts/**",
    ],
  },
  ...(Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals]),
];

export default config;
