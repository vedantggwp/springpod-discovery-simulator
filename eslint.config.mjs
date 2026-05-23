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
      // scripts/** was previously excluded; removed so migration and seed scripts
      // (which mutate production data/schema) get the same quality gate as runtime code.
    ],
  },
  ...(Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals]),
  {
    // Node-aware overrides for operational scripts.
    // .mjs files run under Node, not a browser bundle, so allow Node globals + relax DOM-leaning rules.
    files: ["scripts/**/*.{mjs,js}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      // Scripts intentionally console.log progress.
      "no-console": "off",
    },
  },
];

export default config;
