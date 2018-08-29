# build core
FROM            golang:1.11-alpine as core-builder
RUN             apk --no-cache --update add nodejs-npm make gcc g++ musl-dev openssl-dev
COPY            vendor /go/src/berty.tech/vendor
COPY            core /go/src/berty.tech/core
WORKDIR         /go/src/berty.tech
RUN             cd core && make _ci_prepare # touching generated files
RUN             cd core && make install

# minimal runtime
FROM            alpine
RUN             apk --no-cache --update add openssl
COPY            --from=core-builder /go/bin/berty /bin/berty
ENTRYPOINT      ["/bin/berty"]
CMD             ["daemon"]
EXPOSE          1337
