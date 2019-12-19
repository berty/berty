FROM    moul/protoc-gen-gotemplate:latest as pgg

# build image
FROM    golang:1.13-alpine as builder
# install deps
RUN     apk --no-cache add make git go rsync libc-dev openssh docker npm
# install compilers
RUN     go get -u \
          github.com/gogo/protobuf/gogoproto \
          github.com/gogo/protobuf/jsonpb \
          github.com/gogo/protobuf/proto \
          github.com/gogo/protobuf/protoc-gen-gogo \
          github.com/gogo/protobuf/protoc-gen-gogofast \
          github.com/gogo/protobuf/protoc-gen-gogofaster \
          github.com/gogo/protobuf/protoc-gen-gogoslick \
          github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway \
          github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger \
          github.com/pseudomuto/protoc-gen-doc/cmd/protoc-gen-doc \
          github.com/simplealpine/json2yaml \
          github.com/spf13/cobra \
          github.com/vektah/gorunpkg \
          golang.org/x/tools/cmd/goimports \
          moul.io/protoc-gen-gotemplate
RUN     go get -d github.com/envoyproxy/protoc-gen-validate \
 &&     make -C $GOPATH/src/github.com/envoyproxy/protoc-gen-validate build

# runtime
FROM    golang:1.13-alpine
RUN     apk --no-cache add git openssh make protobuf gcc libc-dev nodejs-npm yarn sudo perl-utils \
 &&     mkdir -p /.cache/go-build \
 &&     chmod -R 777 /.cache \
 &&     npm install -g eclint
COPY    --from=pgg     /go/bin/* /go/bin/
COPY    --from=builder /go/bin/* /go/bin/
COPY    --from=pgg     /protobuf /protobuf
ENV     GOPATH=/go \
        PATH=/go/bin:/node/node_modules/.bin:${PATH} \
        GOROOT=/usr/local/go
