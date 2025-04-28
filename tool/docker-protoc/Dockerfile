FROM    moul/protoc-gen-gotemplate:latest AS pgg

# build image
FROM    golang:1.23.2-bookworm AS builder
# install deps
RUN     set -ex; \
            apt-get update; \
            apt-get install -y --no-install-recommends \
            make git golang-go rsync libc-dev openssh-server docker npm
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
            github.com/srikrsna/protoc-gen-gotag \
            golang.org/x/tools/cmd/goimports

# runtime
FROM    golang:1.23.2-bookworm
RUN     set -ex; \
            apt-get update; \
            apt-get install -y --no-install-recommends \
            git openssh-server make protobuf-compiler gcc libc-dev sudo tar gpg gpg-agent sed grep bash curl yq \
 &&     mkdir -p /.cache/go-build \
 &&     chmod -R 777 /.cache
COPY    --from=pgg     /go/bin/* /go/bin/
COPY    --from=builder /go/bin/* /go/bin/
COPY    --from=pgg     /protobuf /protobuf
ENV     GOPATH=/go \
        PATH=/go/bin:${PATH}:/usr/local/bin \
        GOROOT=/usr/local/go
