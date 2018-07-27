# build core
FROM            golang:1.10-alpine as core-builder
RUN             apk --no-cache --update add nodejs-npm make gcc g++ musl-dev openssl-dev
COPY            vendor /go/src/github.com/berty/berty/vendor
COPY            core /go/src/github.com/berty/berty/core
WORKDIR         /go/src/github.com/berty/berty
RUN             cd core && make _ci_prepare # touching generated files
RUN             cd core && make install

# minimal runtime
FROM            alpine
RUN             apk --no-cache --update add openssl
COPY            --from=core-builder /go/bin/berty /bin/berty
ENTRYPOINT      ["/bin/berty"]
CMD             ["daemon"]
EXPOSE          1337
