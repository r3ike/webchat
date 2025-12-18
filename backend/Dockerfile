FROM node:23-alpine3.21

WORKDIR /backend
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "src/app.js"]