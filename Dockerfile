FROM node:14

LABEL maintainer = "aitor.corchero@eurecat.org"
LABEL maintainer = "lluis.echeverria@eurecat.org"

WORKDIR /piscia/backend

COPY water-middleware-API ./
RUN rm -Rf node_modules/

RUN npm install

EXPOSE 3100
CMD ["npm", "run", "start"]




