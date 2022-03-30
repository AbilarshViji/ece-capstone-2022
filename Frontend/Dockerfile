FROM node:16-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY Frontend .

RUN npm install --production

CMD [ "npm", "start" ]