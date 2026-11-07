# Medslot frontend: Next.js production image.
# Built by the backend repo's docker-compose.yml (service `web`), or on its own:
#   docker build -t medslot-web --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api .
#   docker run -p 3000:3000 medslot-web

# ---- deps: install everything needed to build ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:24-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_* values are inlined into the browser bundle at build time,
# so the API URL must be the one the *browser* can reach.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

# ---- runtime: production deps + build output, non-root ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json /app/next.config.ts ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next

# The official image ships an unprivileged `node` user (uid 1000).
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
