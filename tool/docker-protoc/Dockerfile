FROM    moul/protoc-gen-gotemplate:latest as pgg

# build image
FROM    golang:1.19-alpine as builder
# install deps
RUN     apk --no-cache add make git go rsync libc-dev openssh docker npm
# install compilers
WORKDIR $GOPATH/src/berty.tech/weshnet
COPY    go.mod go.sum ./
RUN     go install -mod=readonly \
		  github.com/bufbuild/buf/cmd/buf \
		  google.golang.org/protobuf/cmd/protoc-gen-go \
          github.com/gogo/protobuf/protoc-gen-gogo \
		  google.golang.org/grpc/cmd/protoc-gen-go-grpc \
          github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway \
          github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger \
          github.com/pseudomuto/protoc-gen-doc/cmd/protoc-gen-doc \
          golang.org/x/tools/cmd/goimports

# runtime
FROM    golang:1.19-alpine
RUN     apk --no-cache add git openssh make protobuf gcc libc-dev nodejs npm yarn sudo perl-utils tar sed grep \
 &&     mkdir -p /.cache/go-build \
 &&     chmod -R 777 /.cache \
 &&     npm install -g eclint
COPY    --from=pgg     /go/bin/* /go/bin/
COPY    --from=builder /go/bin/* /go/bin/
COPY    --from=pgg     /protobuf /protobuf
ENV     GOPATH=/go \
        PATH=/go/bin:/node/node_modules/.bin:${PATH}:/usr/local/bin \
        GOROOT=/usr/local/go
