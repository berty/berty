# syntax=docker/dockerfile:experimental
# build core
FROM            golang:1.12-alpine as core-builder
RUN             apk --no-cache --update add nodejs-npm make gcc g++ musl-dev openssl-dev git openssh
ENV             GO111MODULE=on GOPROXY=https://goproxy.berty.io
COPY            core/go.* /go/src/berty.tech/core/
WORKDIR         /go/src/berty.tech
RUN             mkdir -m 700 /root/.ssh && \
                echo "StrictHostKeyChecking no " > /root/.ssh/config;

RUN             --mount=type=ssh git clone git@github.com:berty/network.git /tmp/network

COPY            core /go/src/berty.tech/core
RUN             --mount=type=ssh cd core && \
                go mod edit -require 'berty.tech/network@v0.0.0' && \
                go mod edit -replace 'berty.tech/network@v0.0.0=/tmp/network' && \
                go get .

RUN             cd core && make _ci_prepare # touching generated files
RUN             cd core && make install

# minimal runtime
FROM            alpine:3.9
RUN             apk --no-cache --update add openssl
COPY            --from=core-builder /go/bin/berty /bin/berty
ENTRYPOINT      ["/bin/berty"]
CMD             ["daemon"]
EXPOSE          1337
