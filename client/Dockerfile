# syntax=docker/dockerfile:1
# Build from repository root: docker build -f client/Dockerfile .
# Serves the SPA; expects the API (same /api path) to be routable. With docker-compose,
# nginx proxies /api to the `api` service. For other deployments, mount a custom nginx
# config or run the app behind a reverse proxy.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci
COPY client ./client
RUN npm run build -w client

FROM nginx:1.27-alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
