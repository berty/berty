# build core
FROM            golang:1.13-alpine as core-builder
RUN             apk --no-cache --update add nodejs-npm make gcc g++ musl-dev openssl-dev git
ENV             GO111MODULE=on
COPY            core/go.* /go/src/berty.tech/core/
COPY            network/go.* /go/src/berty.tech/network/

WORKDIR         /go/src/berty.tech

RUN             cd network && go mod download
RUN             cd core && go mod download

COPY            core /go/src/berty.tech/core
COPY            network /go/src/berty.tech/network

RUN             cd core && make _ci_prepare # touching generated files
RUN             cd core && make install

# minimal runtime
FROM            alpine:3.9
RUN             apk --no-cache --update add openssl
COPY            --from=core-builder /go/bin/berty /bin/berty
ENTRYPOINT      ["/bin/berty"]
CMD             ["daemon"]
EXPOSE          1337
