# Base image
FROM node:10.10.0-alpine

# Create needed directories
RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/common

# Install watchman
RUN mkdir /var/run/watchman
RUN echo "@testing http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk update && apk add --no-cache watchman@testing

# Install common dependencies
COPY common/schema.graphql /usr/src/app/common/schema.graphql
COPY .eslintrc /usr/src/app/.eslintrc
COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock
RUN cd /usr/src/app && yarn --silent

# Install web dependencies
COPY web /usr/src/app/web
RUN cd /usr/src/app/web && yarn --silent

# Start app
WORKDIR /usr/src/app/web
CMD ["yarn", "start"]
