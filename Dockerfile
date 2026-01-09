FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Install Nginx in the Node image (Hybrid approach required for SQLite+Next.js)
RUN apk add --no-cache nginx && \
    mkdir -p /run/nginx

# Copy build output (Standalone mode for efficiency)
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Copy Prisma for migrations
COPY --from=build /app/prisma ./prisma
# Copy node_modules for Prisma binary access
COPY --from=build /app/node_modules ./node_modules

# Copy rootfs (Config files)
COPY ./rootfs /

# Create data directory for database (will be mounted as volume)
RUN mkdir -p /app/data

# Expose ports (8080 for Nginx)
EXPOSE 8080

# Inline CMD to avoid external entrypoint script permission issues
# 1. Ensure data directory exists
# 2. Create/update database schema using local Prisma from node_modules
# 3. Start Next.js in background
# 4. Start Nginx in foreground
CMD sh -c "mkdir -p /app/data && node_modules/.bin/prisma db push --accept-data-loss && node server.js & nginx -g 'daemon off;'"
