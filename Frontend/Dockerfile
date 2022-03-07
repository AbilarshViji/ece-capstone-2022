FROM node:17-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY Frontend .

RUN npm install --production

CMD [ "npm", "start" ]