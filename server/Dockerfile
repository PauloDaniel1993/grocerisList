# syntax=docker/dockerfile:1
# Build from repository root: docker build -f server/Dockerfile .
#
# Required at runtime: SESSION_SECRET (e.g. 32+ random chars) and optional PORT (default 3001).
# Default DATABASE_URL is file:/app/data/app.db; mount a volume on /app/data to persist the DB.

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++ openssl
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci
COPY server ./server
RUN npm run build -w server
RUN npx prisma generate --schema=./server/prisma/schema.prisma
ENV NODE_ENV=production
RUN npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libstdc++ \
  && npm install -g prisma@6.19.3
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production
# Allow login over http (e.g. local Docker); set to 0 behind HTTPS
ENV SESSION_INSECURE_COOKIES=1
ENV DATABASE_URL=file:/app/data/app.db
VOLUME ["/app/data"]
COPY server/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]
