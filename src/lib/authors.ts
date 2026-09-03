export type Author = {
  login: string;
  name: string;
  avatar: string | null;
  htmlUrl: string;
};

/*
 * Post authors, resolved from GitHub logins at build time.
 *
 * This is a network call during `astro build`, which means the build can fail
 * for reasons that have nothing to do with the site: an unauthenticated GitHub
 * API is rate-limited to 60 requests an hour per IP, and CI shares egress. So a
 * failure degrades instead of throwing - the post keeps its byline and profile
 * link, both of which are derivable from the login, and loses only the avatar.
 *
 * Results are cached per login for the lifetime of the build, so N posts by the
 * same person cost one request.
 */

const cache = new Map<string, Promise<Author>>();

function fallback(login: string): Author {
  return {
    login,
    name: login,
    avatar: null,
    htmlUrl: `https://github.com/${login}`,
  };
}

function fetchOne(login: string): Promise<Author> {
  const cached = cache.get(login);
  if (cached) return cached;

  const pending = fetch(`https://api.github.com/users/${login}`, {
    headers: { "User-Agent": "wezel-blog-build" },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`GitHub API ${res.status} for @${login}`);
      const data = await res.json();
      return {
        login: data.login,
        name: data.name ?? data.login,
        avatar: data.avatar_url ?? null,
        htmlUrl: data.html_url,
      };
    })
    .catch((error: unknown) => {
      console.warn(
        `[authors] could not resolve @${login} (${error instanceof Error ? error.message : error}); ` +
          `falling back to the login. The byline is intact, the avatar is not.`,
      );
      return fallback(login);
    });

  cache.set(login, pending);
  return pending;
}

export function fetchAuthors(logins: readonly string[]): Promise<Author[]> {
  return Promise.all(logins.map(fetchOne));
}
