#!/bin/sh
set -e

# Run prisma migration deployment
echo "Running database migrations..."
npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Start the main command (from CMD in Dockerfile)
echo "Starting application..."
exec "$@"
