FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/public-site-react ./apps/public-site-react
ARG VITE_BLOG_API_BASE_URL=http://localhost:7071
ARG VITE_AUTH_API_BASE_URL=http://localhost:7067
ARG VITE_BLOG_MODE=api
ARG VITE_AUTH_MODE=api
ARG VITE_PUBLIC_BASE_URL=
ENV VITE_BLOG_API_BASE_URL=$VITE_BLOG_API_BASE_URL
ENV VITE_AUTH_API_BASE_URL=$VITE_AUTH_API_BASE_URL
ENV VITE_BLOG_MODE=$VITE_BLOG_MODE
ENV VITE_AUTH_MODE=$VITE_AUTH_MODE
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL
RUN npm ci
RUN npm run build --workspace @template/public-site-react

FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
COPY apps/public-site-react/server.mjs ./server.mjs
COPY --from=build /app/apps/public-site-react/dist ./dist
EXPOSE 80
CMD ["node", "server.mjs"]
