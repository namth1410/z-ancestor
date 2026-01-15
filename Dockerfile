FROM node:20-alpine AS base

# Enable BuildKit inline cache for CI/CD optimization
ARG BUILDKIT_INLINE_CACHE=1

# Rebuild the source code only when needed
FROM base AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Prepare a minimal node_modules for Prisma migrations
FROM base AS prisma-deps
WORKDIR /app
RUN npm init -y && npm install prisma@6.19.1 --save-dev

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install Nginx in the Node image (Hybrid approach required for SQLite+Next.js)
RUN apk add --no-cache nginx && \
    mkdir -p /run/nginx /var/lib/nginx /var/log/nginx && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/data && \
    chown -R nextjs:nodejs /app /run/nginx /var/lib/nginx /var/log/nginx

# Copy build output (Standalone mode for efficiency)
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy Prisma for migrations
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma

# Copy only the prisma dependencies for migration
COPY --from=prisma-deps --chown=nextjs:nodejs /app/node_modules ./prisma-deps

# Copy rootfs (Config files)
COPY --chown=nextjs:nodejs ./rootfs /

# Expose ports (8080 for Nginx)
EXPOSE 8080

# Switch to non-root user
USER nextjs

# Inline CMD to avoid external entrypoint script permission issues
# 1. Ensure data directory exists (already owned by nextjs)
# 2. Create/update database schema using the isolated Prisma binary
# 3. Start Next.js in background
# 4. Start Nginx in foreground
CMD ["sh", "-c", "mkdir -p /app/data && ./prisma-deps/.bin/prisma db push --accept-data-loss && node server.js & nginx -g 'daemon off;'"]
