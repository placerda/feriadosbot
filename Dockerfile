FROM node:6.9.1

COPY public/ public/
COPY lib/ lib/
COPY .env .
COPY app.js .
COPY server.js .
COPY package.json .

RUN npm install
EXPOSE 8080
CMD node server.js
