FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/public-site-react ./apps/public-site-react
ARG VITE_BLOG_API_BASE_URL=http://localhost:7071
ARG VITE_BLOG_MODE=api
ENV VITE_BLOG_API_BASE_URL=$VITE_BLOG_API_BASE_URL
ENV VITE_BLOG_MODE=$VITE_BLOG_MODE
RUN npm ci
RUN npm run build --workspace @template/public-site-react

FROM nginx:1.27-alpine AS final
COPY apps/public-site-react/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/public-site-react/dist /usr/share/nginx/html
EXPOSE 80
