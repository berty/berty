FROM            golang:1.11-alpine as builder
RUN             apk --no-cache --update add nodejs-npm make gcc g++ musl-dev openssl-dev
COPY            . /go/src/berty.tech/
WORKDIR         /go/src/berty.tech/client/go/bot/examples/berty-bot-example/
RUN             go install -i

FROM            alpine:3.8
COPY            --from=builder /go/bin/berty-bot-example /bin/berty-bot-example
ENTRYPOINT      ["/bin/berty-bot-example"]
