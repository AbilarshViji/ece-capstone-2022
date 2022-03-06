FROM node:17-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY Frontend .
EXPOSE 3000

RUN npm install --production


CMD [ "npm", "start" ]