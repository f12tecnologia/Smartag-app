FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY tools ./tools
COPY docker/entrypoint.sh /entrypoint.sh
COPY --from=builder /app/dist ./dist

RUN chmod +x /entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server/index.js"]
