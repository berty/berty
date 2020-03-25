# build
FROM            golang:1.14-alpine as builder
RUN             apk add --no-cache git gcc musl-dev make
ENV             GO111MODULE=on
WORKDIR         /go/src/berty.tech/berty
COPY            go.* ./
RUN             go mod download
COPY            ./go ./go
WORKDIR         /go/src/berty.tech/berty/go
RUN             make go.install

# minimalist runtime
FROM            alpine:3.10
LABEL           org.label-schema.build-date=$BUILD_DATE \
                org.label-schema.name="berty" \
                org.label-schema.description="" \
                org.label-schema.url="https://berty.tech/" \
                org.label-schema.vcs-ref=$VCS_REF \
                org.label-schema.vcs-url="https://github.com/berty/berty" \
                org.label-schema.vendor="Berty Technologies" \
                org.label-schema.version=$VERSION \
                org.label-schema.schema-version="1.0" \
                org.label-schema.cmd="docker run -i -t --rm bertytech/berty" \
                org.label-schema.help="docker exec -it $CONTAINER berty --help"
COPY            --from=builder /go/bin/berty /go/bin/rdvp /bin/
ENTRYPOINT      ["/bin/berty"]
#CMD            []
