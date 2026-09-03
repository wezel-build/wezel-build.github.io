import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/*
 * Two fields, deliberately. Structure lives in navigation.yml, not in
 * frontmatter, so the Markdown stays portable - see DOCS-DESIGN.md.
 */
const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

/*
 * The blog. Unlike docs, structure here is chronological rather than manifest-
 * driven, so `date` lives in frontmatter and there is no navigation.yml.
 *
 * `author` holds GitHub logins, resolved at build time by src/lib/authors.ts. It
 * accepts a bare string or a list, and normalises to a list so pages don't have
 * to care which was written.
 */
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    author: z
      .union([z.string(), z.array(z.string()).min(1)])
      .transform((v) => (Array.isArray(v) ? v : [v])),
  }),
});

export const collections = { docs, blog };
