import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { getNavigation, flattenNavigation } from "../lib/docs-navigation.ts";

/*
 * /llms.txt - https://llmstxt.org
 *
 * Generated from `navigation.yml` rather than hand-written, for the same reason
 * the sidebar is: the manifest is the single source of truth for docs structure,
 * and a hand-maintained index would drift the moment a page moved. Because
 * `getNavigation()` validates the manifest against the pages that exist, a stale
 * entry here is a build failure rather than a dead link in a file nobody reads.
 *
 * Order follows the sidebar, so the reading order an LLM gets is the reading
 * order the docs were written in. Descriptions come from each page's frontmatter.
 */

export const GET: APIRoute = async ({ site }) => {
  const navigation = await getNavigation();
  const links = flattenNavigation(navigation);

  const docs = await getCollection("docs");
  const descriptionOf = new Map(
    docs.map((entry) => [entry.id, entry.data.description]),
  );

  const abs = (href: string) => new URL(href, site).href;

  const lines: string[] = [
    "# Wezel",
    "",
    "> Wezel watches the build scenarios a team waits on, records how long they",
    "> take, and reports when that number moves.",
    "",
    "Wezel measures build scenarios declared in a file committed next to the code",
    "it measures. It samples on a schedule rather than on every commit, and when a",
    "summary moves beyond noise it measures the commits it skipped to locate where",
    "the change happened. It reports that a number moved and at which commit; it",
    "does not attribute a cause.",
    "",
    "Runs are stored in SQLite and served by the same binary that records them.",
    "Apache-2.0. Early development - not yet ready for production.",
    "",
    "## Docs",
    "",
  ];

  for (const link of links) {
    const description = descriptionOf.get(link.id);
    lines.push(
      description
        ? `- [${link.label}](${abs(link.href)}): ${description}`
        : `- [${link.label}](${abs(link.href)})`,
    );
  }

  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  if (posts.length > 0) {
    lines.push("", "## Blog", "");
    for (const post of posts) {
      const when = post.data.date.toISOString().slice(0, 10);
      lines.push(
        `- [${post.data.title}](${abs(`/blog/${post.id}`)}) (${when}): ${post.data.description}`,
      );
    }
  }

  lines.push("", "## Elsewhere", "");
  lines.push(`- [Home](${abs("/")})`);
  lines.push("- [Source](https://github.com/wezel-build)");
  lines.push("- [Discord](https://discord.gg/HySRs8TRvH)");
  lines.push("- [Status](https://status.wezel.build)");
  lines.push(`- [Feed](${abs("/rss.xml")})`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
