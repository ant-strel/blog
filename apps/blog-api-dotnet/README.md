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
- protected `POST /api/admin/blog/export/markdown`
- protected `POST /api/admin/blog/import/markdown`
- SQLite by default for local runs
- PostgreSQL in Docker Compose for persistent deployment storage

Default local URL:

`http://127.0.0.1:7071`
