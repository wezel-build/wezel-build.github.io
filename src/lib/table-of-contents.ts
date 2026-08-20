import type { MarkdownHeading } from "astro";

export interface TableOfContentsItem extends MarkdownHeading {
  children: TableOfContentsItem[];
}

/** Converts Astro's flat heading list into a nested table of contents. */
export function generateTableOfContents(
  headings: MarkdownHeading[],
): TableOfContentsItem[] {
  const items: TableOfContentsItem[] = [];

  for (const heading of headings) {
    if (heading.depth < 2 || heading.depth > 3) continue;
    insert(items, { ...heading, children: [] });
  }

  return items;
}

/** Inserts a heading as deeply as its level and the preceding headings allow. */
function insert(items: TableOfContentsItem[], item: TableOfContentsItem): void {
  const previous = items.at(-1);
  if (previous === undefined || previous.depth >= item.depth) {
    items.push(item);
    return;
  }
  insert(previous.children, item);
}
