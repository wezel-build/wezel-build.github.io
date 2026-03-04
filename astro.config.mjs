import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://wezel-dev.github.io",

  integrations: [
    starlight({
      title: "Wezel Docs",
      description:
        "Build observability for teams that care about developer experience.",

      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wezel-dev/wezel",
        },
      ],
      sidebar: [
        { label: "Getting Started", autogenerate: { directory: "docs" } },
        { label: "Concepts", autogenerate: { directory: "docs/concepts" } },
        {
          label: "Self-Hosting",
          autogenerate: { directory: "docs/self-hosting" },
        },
      ],
      customCss: [],
    }),
  ],
});
