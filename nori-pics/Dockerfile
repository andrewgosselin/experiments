FROM oven/bun:1 AS base

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN \
  if [ -f bun.lock ]; then bun install --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f bun.lock ]; then bun run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder /app/data ./data

# Copy and set up entrypoint script
# COPY docker-entrypoint.sh /app/docker-entrypoint.sh
# RUN chmod +x /app/docker-entrypoint.sh

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure nextjs user owns the data directory and can write to it
RUN chown -R nextjs:nodejs /app/data
RUN chmod -R 755 /app/data

# Switch to nextjs user
USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
# ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "server.js"]