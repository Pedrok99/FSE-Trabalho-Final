FROM node:16

WORKDIR /www

COPY package*.json ./

RUN yarn install --network-timeout 600000

COPY . .

EXPOSE 3000

CMD yarn dev