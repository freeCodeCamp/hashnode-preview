FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10 \
  && pnpm install --prod --frozen-lockfile

COPY . .

FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "./src/server.js"]
