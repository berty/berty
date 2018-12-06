# Web
FROM node:10.14.1-slim as web

# Install watchman
RUN apt-get update --no-install-recommends \
    && apt-get install -y git libtool pkg-config libssl-dev build-essential python-dev automake autoconf \
    && cd /tmp \
    && git clone https://github.com/facebook/watchman.git \
    && cd watchman \
    && git checkout v4.9.0 \
    && ./autogen.sh \
    && ./configure --enable-statedir=/tmp \
    && make \
    && make install \
    && mv watchman /usr/local/bin/watchman

VOLUME /usr/src/app

WORKDIR /usr/src/app

CMD cd web && yarn start

# Core
FROM golang:1.11-alpine as core

RUN apk --no-cache --update add nodejs-npm make gcc g++ musl-dev openssl-dev git

ENV GO111MODULE=on GOPROXY=http://goproxy.berty.io:3000

VOLUME /go/src
VOLUME /go/bin

CMD cd /go/src/berty.tech/core \
    && make dev RUN_DAEMON_OPTS="--log-level=debug --jaeger-address=react-native_tracer-service_1:6831"
