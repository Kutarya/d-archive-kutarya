FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY rules.mjs movement.mjs engine.mjs server.mjs ./
USER node
ENV NODE_ENV=production
CMD ["node", "server.mjs"]
