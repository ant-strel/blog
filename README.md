# personal_page_vue

This repository now contains two layers:

- `personal_page/` - the original Vue project kept as a reference.
- `apps/` + `packages/` - the new React/.NET blog platform stack.

Current stack:

- `apps/public-site-react` - public React blog.
- `apps/admin-react` - React admin with article list, editor, publish, archive, and status management.
- `apps/account-react` - auth/account shell for login and profile flows.
- `apps/dashboard-react` - React private dashboard shell.
- `apps/api-dotnet` - standalone JWT auth server.
- `apps/blog-api-dotnet` - standalone blog API with protected article editing endpoints.
- `personal_page/` - Vue reference, kept untouched in role.

Local development:

```bash
npm install
npm run dev:api
npm run dev:blog-api
npm run dev:public
npm run dev:admin
npm run dev:account
npm run dev:dashboard
```

Compose network layout:

- `auth-api` and `blog-api` are internal-only Docker services.
- `public-site`, `admin-site`, `account-site`, and `dashboard-site` are published only on loopback.
- External traffic should terminate on host nginx and route by domain to local frontend ports.

Loopback ports on the VPS host:

- `127.0.0.1:8080` - public React blog.
- `127.0.0.1:8081` - admin React.
- `127.0.0.1:8082` - account React.
- `127.0.0.1:8083` - dashboard React.

Deployment package:

- `deploy/.env.production.example` - production domains and email variables.
- `deploy/nginx/blog-platform.conf.template` - nginx vhost template for arbitrary domains.
- `deploy/scripts/bootstrap-ubuntu.sh` - installs Docker, Compose plugin, nginx, certbot, and envsubst.
- `deploy/scripts/render-nginx-conf.sh` - renders the nginx config from env variables.
- `deploy/scripts/deploy.sh` - reloads nginx, builds containers, and requests TLS certificates.

Typical VPS flow:

```bash
cp deploy/.env.production.example deploy/.env.production
bash deploy/scripts/bootstrap-ubuntu.sh
bash deploy/scripts/deploy.sh
```

Result:

- Public visitors hit only frontend domains.
- React frontends call `/api/...` on the same origin.
- Container nginx proxies those API calls to internal Docker services.
- Auth and blog APIs are not exposed as internet-facing ports.