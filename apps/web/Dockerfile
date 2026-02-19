# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev) for build
RUN npm ci --legacy-peer-deps

# Copy source code and config files
COPY . .
COPY tsconfig.json ./
COPY next.config.js ./

# Create public directory if it doesn't exist
RUN mkdir -p public

# Accept build args for environment variables strictly needed during build (mostly NEXT_PUBLIC)
ARG NEXT_PUBLIC_APP_URL
ARG COOKIE_DOMAIN
ARG STRIPE_PUBLISHABLE_KEY
ARG STRIPE_PRICE_ID_BASIC
ARG STRIPE_PRICE_ID_PRO
ARG STRIPE_PRICE_ID_ENTERPRISE

# Set environment variables for the build
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV COOKIE_DOMAIN=${COOKIE_DOMAIN}
ENV STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
ENV STRIPE_PRICE_ID_BASIC=${STRIPE_PRICE_ID_BASIC}
ENV STRIPE_PRICE_ID_PRO=${STRIPE_PRICE_ID_PRO}
ENV STRIPE_PRICE_ID_ENTERPRISE=${STRIPE_PRICE_ID_ENTERPRISE}

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install curl for health check
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./

# Copy public directory if it exists, otherwise create empty one
RUN mkdir -p public
COPY --from=builder /app/public/ ./public/

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

# Health check - use simple endpoint that doesn't require DB
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/healthz || exit 1

# Start the application
CMD ["npm", "start"]