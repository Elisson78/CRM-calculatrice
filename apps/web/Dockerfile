# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev) for build
RUN npm ci

# Copy source code and config files
COPY . .

# Ensure public directory exists
RUN mkdir -p public/uploads

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application and required files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./

# Ensure public directory exists (create empty if it doesn't exist in builder)
RUN mkdir -p public/uploads

# Copy public directory from builder (create empty if missing)
# Using a simple approach: always try to copy, but ensure directory exists first
RUN --mount=from=builder,source=/app/public,target=/tmp-source-public \
    if [ -d /tmp-source-public ] && [ "$(ls -A /tmp-source-public 2>/dev/null)" ]; then \
      cp -r /tmp-source-public/* ./public/; \
    fi

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
# For standalone output, use the standalone server directly
CMD ["node", ".next/standalone/server.js"]
