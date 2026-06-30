# Blog API Dotnet

Standalone blog/article service for the platform template.

Purpose:

- keep blog/article editing separate from the auth/dashboard scaffold;
- expose public article endpoints for the site;
- expose protected admin CRUD endpoints for article editing lifecycle.

Current scope:

- public `GET /api/blog`
- public `GET /api/blog/{slug}`
- protected `GET/POST/PUT/DELETE /api/admin/blog/articles`
- protected publish/archive transitions
- in-memory persistence for local first-slice work

Default local URL:

`http://127.0.0.1:7071`
