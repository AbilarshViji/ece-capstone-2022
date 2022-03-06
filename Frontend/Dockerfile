FROM node:12.18.1
ENV NODE_ENV=production

COPY Frontend .
EXPOSE 3000

RUN npm install --production


CMD [ "npm", "start" ]