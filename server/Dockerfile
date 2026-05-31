# Stage 1: Build & Generate Prisma Client
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install all dependencies including devDependencies (needed for Prisma CLI generator)
COPY package*.json ./
RUN npm ci

# Copy codebase
COPY . .

# Set placeholder environment variables for build-time Prisma generation
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV JWT_ACCESS_SECRET="placeholder_jwt_access_secret_key_for_build"
ENV JWT_REFRESH_SECRET="placeholder_jwt_refresh_secret_key_for_build"
ENV ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"

# Generate Prisma client using the correct schema path
RUN npx prisma generate --schema=prisma/schema.prisma

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install production dependencies and local Prisma CLI (used for runtime migrations)
RUN npm ci --omit=dev && npm install prisma@7.8.0 --no-save

# Copy the application source code (includes generated Prisma Client and Prisma schema)
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose backend API port
EXPOSE 4000

# Set entrypoint to run migrations and start command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
