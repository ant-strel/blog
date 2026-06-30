# personal_page_vue

This repository now contains two layers:

- `personal_page/` — the original Vue project kept as a reference.
- `apps/` + `packages/` — the new React/.NET blog platform stack.

Current stack:

- `apps/public-site-react` — public React blog.
- `apps/admin-react` — React admin with article list/editor/publish/archive actions.
- `apps/account-react` — auth/account shell.
- `apps/api-dotnet` — JWT auth server.
- `apps/blog-api-dotnet` — standalone blog API with protected article editing.
- `personal_page/` — Vue reference, unchanged in role.

Local development:

```bash
npm install
npm run dev:api
npm run dev:blog-api
npm run dev:public
npm run dev:admin
npm run dev:account
```

Docker / VPS:

```bash
docker compose up --build
```

Default exposed ports:

- `8080` public React blog
- `8081` admin React
- `8082` account React
- `7067` auth API
- `7071` blog API
