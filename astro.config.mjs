import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://wezel-build.github.io",
  base: process.env.SITE_BASE ?? "/",

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
      customCss: [],
    }),
  ],
});
