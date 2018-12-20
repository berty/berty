FROM moul/protoc-gen-gotemplate:latest as pgg

FROM    golang:1.11-alpine as builder

RUN     apk --no-cache add make git go rsync libc-dev openssh docker

RUN     go get -u -v \
        github.com/gogo/protobuf/proto \
        github.com/gogo/protobuf/protoc-gen-gogo \
        github.com/gogo/protobuf/gogoproto \
        github.com/gogo/protobuf/protoc-gen-gofast \
        github.com/gogo/protobuf/jsonpb \
        moul.io/protoc-gen-gotemplate \
        golang.org/x/tools/cmd/goimports \
        github.com/99designs/gqlgen \
        github.com/vektah/gorunpkg \
        github.com/spf13/cobra

RUN     cd /go/src/github.com/99designs/gqlgen && git checkout v0.6.0 && go install github.com/99designs/gqlgen
RUN     rm -f /go/bin/web-editor

FROM    golang:1.11-alpine
RUN     apk --no-cache add git make protobuf gcc libc-dev nodejs-npm && mkdir -p /.cache/go-build && chmod -R 777 /.cache
RUN     mkdir -p /node/ && cd /node && npm install -g protobufjs prettier prettier-eslint prettier-eslint-cli
COPY    --from=pgg /go/bin/* /go/bin/
COPY    --from=builder /go/bin/* /go/bin/
COPY    --from=pgg /protobuf /protobuf
ENV     GOPATH=/go \
        PATH=/go/bin:/node/node_modules/.bin:${PATH} \
        GOROOT=/usr/local/go
