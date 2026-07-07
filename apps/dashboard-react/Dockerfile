FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/dashboard-react ./apps/dashboard-react
ARG VITE_AUTH_API_BASE_URL=http://localhost:7067
ARG VITE_DASHBOARD_API_BASE_URL=http://localhost:7067
ARG VITE_AUTH_MODE=api
ARG VITE_DASHBOARD_MODE=api
ARG VITE_PUBLIC_APP_URL=http://localhost:5173
ARG VITE_ACCOUNT_APP_URL=http://localhost:5174
ARG VITE_ADMIN_APP_URL=http://localhost:5175
ENV VITE_AUTH_API_BASE_URL=$VITE_AUTH_API_BASE_URL
ENV VITE_DASHBOARD_API_BASE_URL=$VITE_DASHBOARD_API_BASE_URL
ENV VITE_AUTH_MODE=$VITE_AUTH_MODE
ENV VITE_DASHBOARD_MODE=$VITE_DASHBOARD_MODE
ENV VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL
ENV VITE_ACCOUNT_APP_URL=$VITE_ACCOUNT_APP_URL
ENV VITE_ADMIN_APP_URL=$VITE_ADMIN_APP_URL
RUN npm ci
RUN npm run build --workspace @template/dashboard-react

FROM nginx:1.27-alpine AS final
COPY apps/dashboard-react/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/dashboard-react/dist /usr/share/nginx/html
EXPOSE 80
