const isGithubPagesBuild = import.meta.env.VITE_GITHUB_PAGES === "true";

export const blogIndexPath = isGithubPagesBuild ? "/" : "/blog";

export function blogArticlePath(slug: string): string {
  return isGithubPagesBuild ? `/${slug}` : `/blog/${slug}`;
}

export { isGithubPagesBuild };
