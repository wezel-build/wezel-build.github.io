import { getCollection } from "astro:content";
import { z } from "astro/zod";
import { parse as parseYaml } from "yaml";

import manifestSource from "../content/docs/navigation.yml?raw";

/*
 * Docs navigation.
 *
 * `src/content/docs/navigation.yml` is the single source of truth for docs
 * structure. This module parses it, validates it against the pages that
 * actually exist, and resolves it into a tree with hrefs.
 *
 * Validation runs during the static build — every page calls `getNavigation()`
 * — so a sidebar that disagrees with the content is a build failure rather than
 * a page nobody can reach.
 */

// ---------------------------------------------------------------- manifest

interface ManifestItem {
  label: string;
  id?: string | undefined;
  items?: ManifestItem[] | undefined;
}

const manifestItemSchema: z.ZodType<ManifestItem> = z.lazy(() =>
  z
    .object({
      label: z.string(),
      id: z.string().optional(),
      items: z.array(manifestItemSchema).nonempty().optional(),
    })
    .strict()
    .refine((item) => item.id !== undefined || item.items !== undefined, {
      message: "A navigation item needs an `id`, nested `items`, or both.",
    }),
);

const manifestSchema = z
  .array(
    z
      .object({
        label: z.string(),
        items: z.array(manifestItemSchema).nonempty(),
      })
      .strict(),
  )
  .nonempty();

export type NavigationManifest = z.infer<typeof manifestSchema>;

/** Parses `navigation.yml`. Throws if the shape is wrong. */
export function parseNavigationManifest(source: string): NavigationManifest {
  const result = manifestSchema.safeParse(parseYaml(source));

  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    throw new Error(
      `navigation.yml is not valid:\n${problems.join("\n")}\n\n` +
        `Each top-level entry needs a \`label\` and a non-empty \`items\` list. ` +
        `Each item needs a \`label\`, plus an \`id\`, nested \`items\`, or both.`,
    );
  }

  return result.data;
}

// ---------------------------------------------------------------- resolved

export interface NavigationLink {
  type: "link";
  id: string;
  label: string;
  href: string;
}

export interface NavigationSubgroup {
  type: "group";
  label: string;
  overview?: NavigationLink;
  children: NavigationItem[];
}

export type NavigationItem = NavigationLink | NavigationSubgroup;

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

/** Docs live under this path. The one place that knows it. */
export const DOCS_BASE = "/docs";

/**
 * The one place that maps a page id onto a URL.
 *
 * Ids are collection entry ids — paths under `src/content/docs/` without the
 * extension — so `index` is the docs landing and `concepts/regressions` is a
 * page beneath it.
 */
export function hrefForId(id: string): string {
  const withoutIndex = id.replace(/(^|\/)index$/, "").replace(/\/$/, "");
  return withoutIndex ? `${DOCS_BASE}/${withoutIndex}` : DOCS_BASE;
}

/**
 * Resolves the manifest against the pages that exist.
 *
 * Throws — failing the build — when the manifest references a page that does
 * not exist, lists a page more than once, or omits a page entirely. The
 * sidebar therefore cannot silently drift from the content: adding a Markdown
 * file and forgetting to link it is a build error, not an invisible page.
 */
export function resolveNavigation(
  manifest: NavigationManifest,
  availableIds: Iterable<string>,
): NavigationGroup[] {
  const available = new Set(availableIds);
  const seen = new Set<string>();
  const problems: string[] = [];

  function resolveItem(item: ManifestItem, groupLabel: string): NavigationItem {
    let link: NavigationLink | undefined;

    if (item.id !== undefined) {
      if (seen.has(item.id)) {
        problems.push(
          `"${item.id}" (under "${groupLabel}") is listed more than once.`,
        );
      } else {
        seen.add(item.id);
        if (!available.has(item.id)) {
          problems.push(
            `"${item.id}" (under "${groupLabel}") does not match any page in src/content/docs.`,
          );
        }
      }

      link = {
        type: "link",
        id: item.id,
        label: item.label,
        href: hrefForId(item.id),
      };
    }

    if (item.items !== undefined) {
      return {
        type: "group",
        label: item.label,
        ...(link !== undefined && { overview: { ...link, label: "Overview" } }),
        children: item.items.map((child) => resolveItem(child, groupLabel)),
      };
    }

    if (link !== undefined) {
      return link;
    }

    // Unreachable: the schema refinement requires an id or items.
    throw new Error(`Navigation item "${item.label}" has no page or children.`);
  }

  const groups = manifest.map((group) => ({
    label: group.label,
    items: group.items.map((item) => resolveItem(item, group.label)),
  }));

  for (const id of available) {
    if (!seen.has(id)) {
      problems.push(`"${id}" is not listed in navigation.yml.`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Docs navigation is out of sync with the content:\n` +
        problems.map((problem) => `  - ${problem}`).join("\n") +
        `\n\nEvery page under src/content/docs must appear in navigation.yml ` +
        `exactly once. Fix the manifest or remove the page.`,
    );
  }

  return groups;
}

// ---------------------------------------------------------------- entry point

let cached: Promise<NavigationGroup[]> | undefined;

/**
 * The resolved navigation tree.
 *
 * Cached because every page calls this during the build and the manifest only
 * needs parsing and validating once.
 */
export function getNavigation(): Promise<NavigationGroup[]> {
  cached ??= (async () => {
    const manifest = parseNavigationManifest(manifestSource);
    const entries = await getCollection("docs");
    return resolveNavigation(
      manifest,
      entries.map((entry) => entry.id),
    );
  })();

  return cached;
}

// ---------------------------------------------------------------- lookups

export interface Breadcrumb {
  label: string;
  href?: string;
}

/**
 * The breadcrumb trail for a page: its group label, any ancestor items, then
 * the page itself. Ancestors that are pages link; the current page and pure
 * category labels are plain text.
 */
export function getBreadcrumbs(
  navigation: NavigationGroup[],
  id: string,
): Breadcrumb[] {
  function find(items: NavigationItem[]): Breadcrumb[] | undefined {
    for (const item of items) {
      if (item.type === "link") {
        if (item.id === id) return [{ label: item.label }];
        continue;
      }

      if (item.overview?.id === id) return [{ label: item.label }];

      const childTrail = find(item.children);
      if (childTrail) {
        return [
          {
            label: item.label,
            ...(item.overview !== undefined && { href: item.overview.href }),
          },
          ...childTrail,
        ];
      }
    }
    return undefined;
  }

  for (const group of navigation) {
    const trail = find(group.items);
    if (trail) return [{ label: group.label }, ...trail];
  }

  return [];
}

/** Flattens the tree into reading order, for prev/next. */
export function flattenNavigation(
  navigation: NavigationGroup[],
): NavigationLink[] {
  const links: NavigationLink[] = [];

  function walk(items: NavigationItem[]): void {
    for (const item of items) {
      if (item.type === "link") {
        links.push(item);
        continue;
      }
      if (item.overview) links.push(item.overview);
      walk(item.children);
    }
  }

  for (const group of navigation) walk(group.items);
  return links;
}

/** The pages either side of `id` in reading order. */
export function getPagerLinks(
  navigation: NavigationGroup[],
  id: string,
): { previous?: NavigationLink; next?: NavigationLink } {
  const links = flattenNavigation(navigation);
  const index = links.findIndex((link) => link.id === id);
  if (index === -1) return {};

  return {
    ...(index > 0 && { previous: links[index - 1] }),
    ...(index < links.length - 1 && { next: links[index + 1] }),
  };
}
