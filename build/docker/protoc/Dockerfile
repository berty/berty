FROM moul/protoc-gen-gotemplate:latest as pgg

FROM    golang:1.12-alpine as builder

# install deps
RUN     apk --no-cache add make git go rsync libc-dev openssh docker npm

# install compilers
RUN     go get -u github.com/99designs/gqlgen \
     && go get -u github.com/gogo/protobuf/gogoproto \
     && go get -u github.com/gogo/protobuf/jsonpb \
     && go get -u github.com/gogo/protobuf/proto \
     && go get -u github.com/gogo/protobuf/protoc-gen-gofast \
     && go get -u github.com/gogo/protobuf/protoc-gen-gogo \
     && go get -d github.com/envoyproxy/protoc-gen-validate && make -C $GOPATH/src/github.com/envoyproxy/protoc-gen-validate build \
     && go get -u github.com/spf13/cobra \
     && go get -u github.com/vektah/gorunpkg \
     && go get -u golang.org/x/tools/cmd/goimports \
     && go get -u moul.io/protoc-gen-gotemplate

# gqlgen
RUN     cd /go/src/github.com/99designs/gqlgen && git checkout v0.6.0 && go install github.com/99designs/gqlgen
RUN     rm -f /go/bin/web-editor

FROM    golang:1.12-alpine
RUN     apk --no-cache add git make protobuf gcc libc-dev nodejs-npm && mkdir -p /.cache/go-build && chmod -R 777 /.cache
RUN     mkdir -p /node/ && cd /node && npm install -g protobufjs prettier prettier-eslint prettier-eslint-cli
RUN     echo 'syntax = "proto3";' | /usr/bin/pbjs - > /dev/null # init pbjs
RUN     npm install -g pbhbs@latest
COPY    --from=pgg /go/bin/* /go/bin/
COPY    --from=builder /go/bin/* /go/bin/
COPY    --from=pgg /protobuf /protobuf
ENV     GOPATH=/go \
        PATH=/go/bin:/node/node_modules/.bin:${PATH} \
        GOROOT=/usr/local/go
