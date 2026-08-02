// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://wezel.build",
  integrations: [
    starlight({
      title: "wezel",
      description:
        "Documentation for Wezel — Cargo-native build regression observability.",
      // Docs entries live in src/content/docs/docs/**, so Starlight owns /docs/*
      // and src/pages/index.astro keeps ownership of /.
      customCss: ["./src/styles/global.css", "./src/styles/docs.css"],
      components: {
        // Landing chrome, reused verbatim so the header doesn't change between / and /docs.
        Header: "./src/components/docs/Header.astro",
        // Light theme only — see docs.css.
        ThemeProvider: "./src/components/docs/ThemeProvider.astro",
        ThemeSelect: "./src/components/docs/ThemeSelect.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wezel-build",
        },
      ],
      // Plugin reference is deliberately absent from the top level.
      sidebar: [
        {
          label: "Get started",
          // `docs` is src/content/docs/docs/index.md — the /docs landing.
          items: [
            { slug: "docs" },
            { slug: "docs/installation" },
            { slug: "docs/quickstart" },
          ],
        },
        {
          label: "Concepts",
          items: [
            { slug: "docs/concepts/experiments" },
            { slug: "docs/concepts/observations" },
            { slug: "docs/concepts/regressions" },
          ],
        },
        // Server comes before tracking: you stand up somewhere to send results
        // before you start sending them.
        {
          label: "Server",
          items: [
            { slug: "docs/server/overview" },
            { slug: "docs/server/self-hosting" },
          ],
        },
        {
          label: "Tracking",
          items: [
            { slug: "docs/tracking/scenarios" },
            { slug: "docs/tracking/continuous-integration" },
          ],
        },
        {
          label: "Reference",
          collapsed: true,
          items: [{ slug: "docs/reference/cli" }, { slug: "docs/reference/configuration" }],
        },
      ],
      // Chrome we don't want.
      credits: false,
      lastUpdated: false,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      expressiveCode: {
        themes: ["github-light"],
        styleOverrides: {
          borderRadius: "0.6rem",
          borderColor: "var(--color-line)",
          codeBackground: "var(--color-surface)",
          codeFontFamily: "var(--font-mono)",
          codeFontSize: "0.85rem",
          uiFontFamily: "var(--font-mono)",
          frames: {
            editorTabBarBackground: "var(--color-veil)",
            editorTabBarBorderBottomColor: "var(--color-line)",
            editorActiveTabBackground: "var(--color-surface)",
            editorActiveTabBorderColor: "var(--color-line)",
            editorActiveTabIndicatorTopColor: "var(--color-accent)",
            editorTabBorderRadius: "0.35rem",
            terminalBackground: "var(--color-surface)",
            terminalTitlebarBackground: "var(--color-veil)",
            terminalTitlebarBorderBottomColor: "var(--color-line)",
            shadowColor: "transparent",
          },
        },
      },
    }),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
