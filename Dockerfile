FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm \
  && pnpm install --prod

COPY . .

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "./src/server.js"]
