FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
USER node
ENV NODE_ENV=production
CMD ["node", "server.mjs"]
