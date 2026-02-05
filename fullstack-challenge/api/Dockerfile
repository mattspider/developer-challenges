FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate --schema=api/prisma/schema.prisma
RUN npx nx build api

FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.base.json ./
COPY --from=builder /app/api ./api
RUN npx prisma generate --schema=api/prisma/schema.prisma
EXPOSE 3333
CMD ["sh", "-c", "npx prisma migrate deploy --schema=api/prisma/schema.prisma && (cd api && npx prisma db seed) && node dist/api/src/main.js"]
