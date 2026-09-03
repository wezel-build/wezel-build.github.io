import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/*
 * The blog feed.
 *
 * Hand-rolled rather than pulling in @astrojs/rss: the whole feed is a title, a
 * link, a date and a description per post, and a dependency for thirty lines of
 * XML is a dependency to keep updated. Same call as llms.txt.
 *
 * Descriptions only, not full post bodies - rendering Markdown to
 * feed-safe HTML is where this would stop being thirty lines.
 */

// Five characters have to be escaped in XML text; getting this wrong is how
// feeds break on a single apostrophe in a title.
const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const self = new URL("/rss.xml", site).href;
  const home = new URL("/", site).href;

  const items = posts
    .map((post) => {
      const url = new URL(`/blog/${post.id}`, site).href;
      return `    <item>
      <title>${escape(post.data.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escape(post.data.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Wezel</title>
    <link>${escape(home)}</link>
    <atom:link href="${escape(self)}" rel="self" type="application/rss+xml" />
    <description>Notes on build performance, developer tooling, and building Wezel.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
