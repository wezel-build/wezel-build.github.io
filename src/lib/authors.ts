export type Author = {
  login: string;
  name: string;
  avatar: string;
  htmlUrl: string;
};

const cache = new Map<string, Promise<Author>>();

function fetchOne(login: string): Promise<Author> {
  let cached = cache.get(login);
  if (cached) return cached;
  cached = fetch(`https://api.github.com/users/${login}`, {
    headers: { 'User-Agent': 'wezel-blog-build' },
  }).then(async (res) => {
    if (!res.ok) throw new Error(`GitHub API ${res.status} for @${login}`);
    const data = await res.json();
    return {
      login: data.login,
      name: data.name ?? data.login,
      avatar: data.avatar_url,
      htmlUrl: data.html_url,
    };
  });
  cache.set(login, cached);
  return cached;
}

export function fetchAuthors(logins: readonly string[]): Promise<Author[]> {
  return Promise.all(logins.map(fetchOne));
}
