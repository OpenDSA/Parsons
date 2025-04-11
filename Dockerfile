FROM node:22

WORKDIR /app

COPY . .

RUN npm install --include=dev
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]