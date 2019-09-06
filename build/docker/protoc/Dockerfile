FROM moul/protoc-gen-gotemplate:latest as pgg

FROM    golang:1.13-alpine as builder

# install deps
RUN     apk --no-cache add make git go rsync libc-dev openssh docker npm

# install compilers
RUN  go get -u github.com/gogo/protobuf/gogoproto \
     && go get -u github.com/gogo/protobuf/jsonpb \
     && go get -u github.com/gogo/protobuf/proto \
     && go get -u github.com/gogo/protobuf/protoc-gen-gofast \
     && go get -u github.com/gogo/protobuf/protoc-gen-gogo \
     && go get -d github.com/envoyproxy/protoc-gen-validate && make -C $GOPATH/src/github.com/envoyproxy/protoc-gen-validate build \
     && go get -u github.com/spf13/cobra \
     && go get -u github.com/vektah/gorunpkg \
     && go get -u golang.org/x/tools/cmd/goimports \
     && go get -u moul.io/protoc-gen-gotemplate

RUN     rm -f /go/bin/web-editor

FROM    golang:1.13-alpine
RUN     apk --no-cache add git openssh make protobuf gcc libc-dev nodejs-npm sudo && mkdir -p /.cache/go-build && chmod -R 777 /.cache
RUN     mkdir -p /node/ && cd /node && npm install -g npm@6.9.0 protobufjs prettier prettier-eslint prettier-eslint-cli  pbhbs@0.1.0
RUN     echo 'syntax = "proto3";' | /usr/bin/pbjs - > /dev/null # init pbjs
COPY    --from=pgg /go/bin/* /go/bin/
COPY    --from=builder /go/bin/* /go/bin/
COPY    --from=pgg /protobuf /protobuf
ENV     GOPATH=/go \
        PATH=/go/bin:/node/node_modules/.bin:${PATH} \
        GOROOT=/usr/local/go
