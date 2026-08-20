// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";
import { remarkAlert } from "remark-github-blockquote-alert";

/**
 * Lifts a code fence's `title="…"` / `frame="terminal"` into a `<figure>` with a
 * caption, so the filename can be set as a caption rather than as chrome.
 *
 * This replaces the one Expressive Code feature the docs actually used. Plain
 * Shiki is otherwise preferred, because `theme: "css-variables"` lets code
 * inherit the Wezel palette instead of importing an editor theme.
 *
 * @type {() => import("shiki").ShikiTransformer}
 */
const codeFigure = () => ({
  name: "wezel:code-figure",
  root(root) {
    const raw = String(this.options.meta?.__raw ?? "");
    const title = /title="([^"]+)"/.exec(raw)?.[1];
    const caption = title ?? (/frame="terminal"/.test(raw) ? "Terminal" : null);
    if (caption === null) return;

    return {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "figure",
          properties: { className: ["code-figure"] },
          children: [
            {
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: [{ type: "text", value: caption }],
            },
            ...root.children,
          ],
        },
      ],
    };
  },
});

// https://astro.build/config
export default defineConfig({
  site: "https://wezel.build",
  // Pagefind indexes the built HTML after the build and serves /pagefind/ in
  // dev from the last build output — so `astro dev` has no index until
  // `astro build` has run at least once.
  integrations: [mdx(), sitemap(), pagefind()],
  markdown: {
    remarkPlugins: [remarkAlert],
    shikiConfig: {
      // Inherits the palette from docs.css rather than shipping its own.
      theme: "css-variables",
      transformers: [codeFigure()],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
