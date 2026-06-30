FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/admin-react ./apps/admin-react
ARG VITE_AUTH_API_BASE_URL=http://localhost:7067
ARG VITE_BLOG_API_BASE_URL=http://localhost:7071
ARG VITE_DASHBOARD_API_BASE_URL=http://localhost:7067
ARG VITE_AUTH_MODE=api
ARG VITE_BLOG_MODE=api
ARG VITE_DASHBOARD_MODE=api
ENV VITE_AUTH_API_BASE_URL=$VITE_AUTH_API_BASE_URL
ENV VITE_BLOG_API_BASE_URL=$VITE_BLOG_API_BASE_URL
ENV VITE_DASHBOARD_API_BASE_URL=$VITE_DASHBOARD_API_BASE_URL
ENV VITE_AUTH_MODE=$VITE_AUTH_MODE
ENV VITE_BLOG_MODE=$VITE_BLOG_MODE
ENV VITE_DASHBOARD_MODE=$VITE_DASHBOARD_MODE
RUN npm ci
RUN npm run build --workspace @template/admin-react

FROM nginx:1.27-alpine AS final
COPY apps/admin-react/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin-react/dist /usr/share/nginx/html
EXPOSE 80
