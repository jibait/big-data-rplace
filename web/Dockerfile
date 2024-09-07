FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p dist && chmod -R 755 dist
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]