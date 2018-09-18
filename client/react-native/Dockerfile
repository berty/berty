# Base image
FROM node:alpine

# Create needed directories
RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/web
RUN mkdir /usr/src/app/common

# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV PATH /usr/src/app/web/node_modules/.bin:$PATH

# Install common dependencies
COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock
RUN cd /usr/src/app && yarn --silent

# Install web dependencies
COPY web/package.json /usr/src/app/web/package.json
COPY web/yarn.lock /usr/src/app/web/yarn.lock
RUN cd /usr/src/app/web && yarn --silent

# Install watchman
RUN mkdir /var/run/watchman
RUN echo "@testing http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk update && apk add --no-cache watchman@testing

# Start app
WORKDIR /usr/src/app/web
CMD ["yarn", "start"]
