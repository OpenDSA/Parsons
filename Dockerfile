FROM node:22-slim AS build

WORKDIR /app

COPY package*.json ./


RUN npm ci --only=production


COPY . .

FROM node:22-slim

WORKDIR /app

COPY --from=build /app /app


EXPOSE 3000

ENV NODE_ENV=production

CMD ["node","server/index.js"]