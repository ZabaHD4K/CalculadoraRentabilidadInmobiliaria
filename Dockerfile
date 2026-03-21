FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ .

EXPOSE 8000

CMD ["node", "server.js"]
