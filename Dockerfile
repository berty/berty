# syntax=docker/dockerfile:experimental
# build core
FROM            golang:1.12-alpine as core-builder
RUN             apk --no-cache --update add nodejs-npm make gcc g++ musl-dev openssl-dev git openssh
ENV             GO111MODULE=on GOPROXY=https://goproxy.berty.io
COPY            core/go.* /go/src/berty.tech/core/
WORKDIR         /go/src/berty.tech
COPY            core /go/src/berty.tech/core

#               @HOTFIX manually get berty.tech network & checkout the right commit
RUN             --mount=type=ssh mkdir -m 700 /root/.ssh && \
                echo "StrictHostKeyChecking no " > /root/.ssh/config && \
                git clone git@github.com:berty/network.git /tmp/network && \
                git -C /tmp/network checkout "$(cat core/go.mod | grep berty.tech/network | sed -E 's/.*-(.+)$/\1/')" && \
                cd core && \
                go mod edit -require 'berty.tech/network@v0.0.0' && \
                go mod edit -replace 'berty.tech/network@v0.0.0=/tmp/network'

RUN             cd core && go get .
RUN             cd core && make _ci_prepare # touching generated files
RUN             cd core && make install

# minimal runtime
FROM            alpine:3.9
RUN             apk --no-cache --update add openssl
COPY            --from=core-builder /go/bin/berty /bin/berty
ENTRYPOINT      ["/bin/berty"]
CMD             ["daemon"]
EXPOSE          1337
