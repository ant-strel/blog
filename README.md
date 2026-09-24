# d-antes.com — transparent public blog

This public repository contains the reading site and its **published articles**.
It deploys to **GitHub Pages at https://d-antes.com**, not to a VPS.
There is no editor, authentication backend, database, private draft, or token for
a private repository in this build. The app uses no cookies, persistent browser
storage, analytics, or tracking embeds; search runs locally.

## GitHub Pages setup (once)

In this repository's Settings → Pages select **GitHub Actions**, then set
**Custom domain: d-antes.com**. Verify ownership of the domain and configure its
DNS for GitHub Pages. Enable **Enforce HTTPS** once the certificate is ready.
The included CNAME documents the intended domain, but Actions deployments use
the Pages setting, not CNAME, to configure it.

See [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
and [Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
The workflow cannot configure your DNS. Do not point this domain at a VPS.
Keep any other subdomain's DNS records separate; no wildcard records are needed.

After setup, a push to main builds/tests and deploys only
`apps/public-site-react/dist`. Pull requests run checks but cannot deploy.
The `github-pages` environment should allow deployments from main only.
You can also run the workflow manually on main. No separate gh-pages branch,
VPS, deployment key or personal access token is needed for publication.

## Local checks

Requires Node.js 22: `npm ci`, `npm test`.
Set `VITE_PUBLIC_BASE_URL=https://d-antes.com`, then `npm run build` and
`node scripts/check-pages.mjs`. For development: `npm run dev`.

Every article gets its own HTML file, with a sitemap and custom 404 page, so
direct links work on Pages without an API proxy or SPA rewrite.
The public UI and contact/resume content retain the `static_site` baseline
(`331d6db`): the blog lives at `/`, contacts at `/contact`, articles at `/<slug>`.
The `/blog` and `/blog/<slug>` routes remain compatibility aliases. Contact copy
is shared by the React view and generated HTML; the site also publishes `/rss.xml`.
Theme preferences stay in memory only, unlike the old mixed application's storage.
The production HTML applies a CSP via meta tags. This does not provide header-only
controls such as frame-ancestors or control GitHub's server logs.

## Publication

`content/published.json` is the complete public snapshot. Published texts are
intentionally available both in this repository and on the site. An editorial
system explicitly prepares this allowlisted file; review its diff before commit.
Never copy full Markdown backups, drafts, database dumps, or private code here.

A push of an approved snapshot to main triggers the Pages deployment. The reading
site never fetches articles or credentials from a private repository at runtime.
Withdrawing an article requires a new snapshot and successful deployment; older
Git commits, downloads and caches can retain it. Empty snapshots are supported.

## Privacy limits

The app itself does not set cookies or store visitor preferences persistently.
GitHub Pages and network infrastructure may log request/IP metadata; this source
code cannot turn off their logging. Verify the live domain in a fresh browser
profile, including response headers, cookies, storage and network requests.
Old cookies or service workers from an earlier host need separate cleanup.
An open repository alone does not prove which exact build a host is serving.

The original Git history predates the separation and remains available. Removing
files from main does not erase old commits, branches or previously downloaded copies.
