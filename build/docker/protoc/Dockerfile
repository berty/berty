FROM moul/protoc-gen-gotemplate:latest as pgg

FROM    golang:1.12-alpine as builder

# install deps
RUN     apk --no-cache add make git go rsync libc-dev openssh docker

# install compilers
RUN     go get -u github.com/99designs/gqlgen
RUN     go get -u github.com/gogo/protobuf/gogoproto
RUN     go get -u github.com/gogo/protobuf/jsonpb
RUN     go get -u github.com/gogo/protobuf/proto
RUN     go get -u github.com/gogo/protobuf/protoc-gen-gofast
RUN     go get -u github.com/gogo/protobuf/protoc-gen-gogo
RUN     go get -u github.com/lyft/protoc-gen-validate
RUN     go get -u github.com/spf13/cobra
RUN     go get -u github.com/vektah/gorunpkg
RUN     go get -u golang.org/x/tools/cmd/goimports
RUN     go get -u moul.io/protoc-gen-gotemplate

# gqlgen
RUN     cd /go/src/github.com/99designs/gqlgen && git checkout v0.6.0 && go install github.com/99designs/gqlgen
RUN     rm -f /go/bin/web-editor

FROM    golang:1.12-alpine
RUN     apk --no-cache add git make protobuf gcc libc-dev nodejs-npm && mkdir -p /.cache/go-build && chmod -R 777 /.cache
RUN     mkdir -p /node/ && cd /node && npm install -g protobufjs prettier prettier-eslint prettier-eslint-cli
COPY    --from=pgg /go/bin/* /go/bin/
COPY    --from=builder /go/bin/* /go/bin/
COPY    --from=pgg /protobuf /protobuf
ENV     GOPATH=/go \
        PATH=/go/bin:/node/node_modules/.bin:${PATH} \
        GOROOT=/usr/local/go
