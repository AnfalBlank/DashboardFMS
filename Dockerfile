# ===================================================
# Stage 1: Build NestJS Application
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ===================================================
# Stage 2: Production Runner
# ===================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root system group and user for security
RUN addgroup -S nodejs -g 1001 && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled build output from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main.js"]
