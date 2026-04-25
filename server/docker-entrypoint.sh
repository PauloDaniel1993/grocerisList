#!/bin/sh
set -e
mkdir -p /app/data
# Ensure SQLite can be created; align Prisma version with project lock (see server/Dockerfile)
prisma db push --schema=/app/server/prisma/schema.prisma
exec node /app/server/dist/index.js
