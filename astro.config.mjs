import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://wezel.build",
  base: process.env.SITE_BASE ?? "/",

  // /docs has no landing page of its own — send it to the introduction.
  redirects: {
    "/docs": "/docs/introduction",
  },

  // Code blocks in the hand-authored landing body (src/home/index.mdx).
  // Starlight manages its own theming for docs separately.
  markdown: {
    shikiConfig: { theme: "vitesse-dark", wrap: false },
  },

  integrations: [
    starlight({
      title: "Wezel Docs",
      description:
        "Build observability for teams that care about developer experience.",

      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wezel-build/wezel",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", link: "/docs/introduction" },
            { label: "Quick Start", link: "/docs/quickstart" },
          ],
        },
        { label: "Concepts", autogenerate: { directory: "docs/concepts" } },
        {
          label: "Self-Hosting",
          autogenerate: { directory: "docs/self-hosting" },
        },
        {
          label: "Forager",
          autogenerate: { directory: "docs/forager" },
        },
        {
          label: "Developing Wezel",
          autogenerate: { directory: "docs/developing" },
        },
      ],
      customCss: ["./src/styles/starlight.css"],
      head: [
        // Light-only: pin the theme so expressive-code and everything else
        // render light, regardless of OS preference or any stored value.
        {
          tag: 'script',
          content:
            "try{localStorage.setItem('starlight-theme','light')}catch(e){}document.documentElement.dataset.theme='light';",
        },
        {
          tag: 'script',
          attrs: {
            src: 'https://cloud.umami.is/script.js',
            'data-website-id': '83b509e2-8cc4-430d-a0aa-876262ff4082',
            defer: true,
          },
        },
      ],
    }),
    // mdx() must come after starlight() — Starlight registers
    // expressive-code, which has to be set up before MDX.
    mdx(),
  ],
});
