// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";
import { remarkAlert } from "remark-github-blockquote-alert";

/**
 * Turns comment-delimited ranges in an `annotate` code fence into highlighted
 * source and a numbered explanation list. The directive comments are removed,
 * so copied code remains ready to use.
 *
 * ```md
 * ```toml annotate
 * # @annotation select="exec" What this table configures.
 * [tools.foragers.exec]
 * # @endannotation
 * ```
 * ```
 *
 * @typedef {{ start: number, end: number, note: string, select?: string }} CodeAnnotation
 * @type {() => import("shiki").ShikiTransformer}
 */
const codeAnnotations = () => {
  let block = 0;

  return {
    name: "wezel:code-annotations",
    preprocess(code, options) {
      const raw = String(this.options.meta?.__raw ?? "");
      if (!/(?:^|\s)annotate(?:\s|$)/.test(raw)) return;

      /** @type {CodeAnnotation[]} */
      const annotations = [];
      /** @type {{ start: number, note: string, select?: string } | null} */
      let open = null;
      const source = [];

      for (const line of code.split("\n")) {
        const annotation = /^\s*#\s*@annotation\s+(.+?)\s*$/.exec(line);
        const end = /^\s*#\s*@endannotation\s*$/.test(line);

        if (annotation) {
          if (open !== null) {
            throw new Error("Code annotations cannot be nested.");
          }

          const selected = /^select=("(?:\\.|[^"\\])*")\s+(.+)$/.exec(annotation[1]);
          if (annotation[1].startsWith("select=") && selected === null) {
            throw new Error('Code annotation selectors use select="exact text" followed by a note.');
          }

          if (selected === null) {
            open = { start: source.length + 1, note: annotation[1] };
          } else {
            /** @type {string} */
            let select;
            try {
              select = JSON.parse(selected[1]);
            } catch {
              throw new Error("Code annotation selector is not a valid quoted string.");
            }
            if (select.length === 0 || select.includes("\n")) {
              throw new Error("Code annotation selector must be non-empty and stay on one line.");
            }
            open = { start: source.length + 1, note: selected[2], select };
          }
          continue;
        }

        if (end) {
          if (open === null || source.length < open.start) {
            throw new Error("Code annotations must contain at least one line.");
          }
          annotations.push({ ...open, end: source.length });
          open = null;
          continue;
        }

        source.push(line);
      }

      if (open !== null) {
        throw new Error("Code annotation is missing # @endannotation.");
      }

      if (annotations.length === 0) {
        throw new Error("An annotate code fence must contain an annotation.");
      }

      block += 1;
      /** @type {number[]} */
      const lineOffsets = [];
      let offset = 0;
      for (const line of source) {
        lineOffsets.push(offset);
        offset += line.length + 1;
      }
      for (const [index, annotation] of annotations.entries()) {
        if (annotation.select === undefined) continue;

        const range = source.slice(annotation.start - 1, annotation.end).join("\n");
        const match = range.indexOf(annotation.select);
        const duplicate = range.indexOf(annotation.select, match + 1);
        if (match === -1 || duplicate !== -1) {
          throw new Error(
            `Code annotation selector ${JSON.stringify(annotation.select)} must match exactly once in its range.`,
          );
        }

        const start = lineOffsets[annotation.start - 1] + match;
        options.decorations ??= [];
        options.decorations.push({
          start,
          end: start + annotation.select.length,
          alwaysWrap: true,
          properties: {
            className: [
              "annotated-code__selection",
              ...(index === 0 ? ["is-active"] : []),
            ],
            dataCodeAnnotation: String(index + 1),
            ariaDescribedBy: `code-annotation-panel-${block}-${index + 1}`,
          },
        });
      }

      /** @type {{ codeAnnotationBlock?: number, codeAnnotations?: CodeAnnotation[] }} */ (
        this.meta
      ).codeAnnotationBlock = block;
      /** @type {{ codeAnnotationBlock?: number, codeAnnotations?: CodeAnnotation[] }} */ (
        this.meta
      ).codeAnnotations = annotations;
      return source.join("\n");
    },
    line(line, number) {
      const meta = /** @type {{ codeAnnotationBlock?: number, codeAnnotations?: CodeAnnotation[] }} */ (
        this.meta
      );
      const annotations = meta.codeAnnotations ?? [];
      const index = annotations.findIndex(
        ({ start, end }) => number >= start && number <= end,
      );
      if (index === -1 || annotations[index].select !== undefined) return;

      this.addClassToHast(line, "annotated-code__line");
      line.properties.dataCodeAnnotation = String(index + 1);
      line.properties.ariaDescribedBy =
        `code-annotation-panel-${meta.codeAnnotationBlock}-${index + 1}`;
      if (index === 0) {
        this.addClassToHast(line, "is-active");
      }
    },
    root(root) {
      const meta = /** @type {{ codeAnnotationBlock?: number, codeAnnotations?: CodeAnnotation[] }} */ (
        this.meta
      );
      const annotations = meta.codeAnnotations;
      if (annotations === undefined) return;

      this.addClassToHast(this.pre, "annotated-code__source");
      this.pre.properties.ariaDescribedBy =
        `code-annotation-panel-${meta.codeAnnotationBlock}-1`;
      return {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "div",
            properties: {
              className: ["annotated-code"],
              dataActiveAnnotation: "1",
            },
            children: [
              ...root.children,
              {
                type: "element",
                tagName: "div",
                properties: { className: ["annotated-code__explanation"] },
                children: [
                  {
                    type: "element",
                    tagName: "ol",
                    properties: {
                      className: ["annotated-code__steps"],
                      role: "tablist",
                      ariaLabel: "Code annotations",
                    },
                    children: annotations.map((_, index) => ({
                      type: "element",
                      tagName: "li",
                      properties: { role: "presentation" },
                      children: [
                        {
                          type: "element",
                          tagName: "button",
                          properties: {
                            className: ["annotated-code__step"],
                            type: "button",
                            role: "tab",
                            id: `code-annotation-tab-${meta.codeAnnotationBlock}-${index + 1}`,
                            ariaControls: `code-annotation-panel-${meta.codeAnnotationBlock}-${index + 1}`,
                            ariaSelected: index === 0 ? "true" : "false",
                            tabIndex: index === 0 ? 0 : -1,
                            dataAnnotationTarget: String(index + 1),
                          },
                          children: [{ type: "text", value: String(index + 1) }],
                        },
                      ],
                    })),
                  },
                  {
                    type: "element",
                    tagName: "div",
                    properties: { className: ["annotated-code__panels"] },
                    children: annotations.map(({ note }, index) => ({
                      type: "element",
                      tagName: "p",
                      properties: {
                        id: `code-annotation-panel-${meta.codeAnnotationBlock}-${index + 1}`,
                        role: "tabpanel",
                        ariaLabelledBy: `code-annotation-tab-${meta.codeAnnotationBlock}-${index + 1}`,
                        ...(index === 0 ? {} : { hidden: true }),
                      },
                      children: [{ type: "text", value: note }],
                    })),
                  },
                ],
              },
            ],
          },
        ],
      };
    },
  };
};

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
  // dev from the last build output - so `astro dev` has no index until
  // `astro build` has run at least once.
  integrations: [mdx(), sitemap(), pagefind()],
  markdown: {
    remarkPlugins: [remarkAlert],
    shikiConfig: {
      // Inherits the palette from docs.css rather than shipping its own.
      theme: "css-variables",
      transformers: [codeAnnotations(), codeFigure()],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
