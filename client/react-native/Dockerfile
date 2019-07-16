# Web
FROM node:10.14.1-slim as web

# Install watchman
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git libtool pkg-config libssl-dev build-essential python-dev automake autoconf \
    && cd /tmp \
    && git clone https://github.com/facebook/watchman.git \
    && cd watchman \
    && git checkout v4.9.0 \
    && ./autogen.sh \
    && ./configure --enable-statedir=/tmp \
    && make \
    && make install \
    && mv watchman /usr/local/bin/watchman \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

VOLUME /usr/src/app

WORKDIR /usr/src/app/web

# FIXME: uncomment it when dockerlint will support mutli stage build
# CMD yarn start

# Core
FROM golang:1.12-stretch as core

RUN apt-get update \
    && apt-get install -y  --no-install-recommends \
        yarn make gcc g++ musl-dev libssl-dev git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV GO111MODULE=on GOPROXY=

WORKDIR /go/src/berty.tech/core

CMD make dev RUN_DAEMON_OPTS="--log-level=debug --jaeger-address=react-native_tracer-service_1:6831"
