FROM node:12-alpine as base

# =====================
FROM base as builder

# node-gyp needs python
RUN apk add --no-cache --virtual .gyp python make g++

WORKDIR /app/

# copy 1st only dependency manifests
COPY package*.json ./

# install exact
RUN npm ci

# copy 2nd source
COPY . .

# build dist
RUN npm run build

# =====================
FROM base as app

# run as non-root user
USER node:node
WORKDIR /home/node/app

# Copy stuff from builder with non-root
COPY --from=builder --chown=node:node /app/node_modules node_modules
COPY --from=builder --chown=node:node /app/dist dist
COPY --from=builder --chown=node:node /app/package*.json ./

ENV PORT 3020
EXPOSE 3020

CMD ["npm", "run", "start:prod"]