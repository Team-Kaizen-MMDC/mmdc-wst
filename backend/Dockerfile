### Multi-stage Dockerfile for the mmdc-wst backend
# Uses Node 18 LTS, installs dependencies, copies source, and runs the app
FROM node:18-bullseye AS builder
WORKDIR /usr/src/app

# Install dependencies (only production by default)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --production

# Copy source
COPY . .

# If there is a build step for static assets (tailwind etc.), run it here
# This repo typically serves bundled static files; run any build scripts if present.
RUN if [ -f ../package.json ] && npm run --silent --prefix .. build:tailwind 2>/dev/null; then echo "built root tailwind"; fi || true

FROM node:18-bullseye-slim AS runner
WORKDIR /usr/src/app

# Create non-root user
RUN useradd --user-group --create-home --shell /bin/false appuser

# Copy node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy app source
COPY --from=builder /usr/src/app .

# Use environment variables at runtime
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Use a non-root user for better security
USER appuser

CMD ["node", "server.js"]
