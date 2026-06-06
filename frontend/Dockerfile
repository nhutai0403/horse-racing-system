# --- Build Stage ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install
COPY . .
# Build for production (removes dev dependencies, optimizes bundle)
RUN npm run build

# --- Runtime Stage ---
FROM node:22-alpine
WORKDIR /app
# Create non-root user for security
RUN addgroup -g 1001 appuser && adduser -D -u 1001 -G appuser appuser
# Copy built assets and production dependencies only
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci && chown -R appuser:appuser /app
USER appuser
EXPOSE 5173
# Use production node server instead of dev server
CMD ["npm", "run", "dev"]
