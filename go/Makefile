PROTOS_SRC := $(wildcard ../api/*.proto) $(wildcard ../api/internal/*.proto)
PROTOS_GEN := $(patsubst %.proto,%.pb.go,$(PROTOS_SRC))

.PHONY: install
install: generate
	go install ./cmd/...

.PHONY: test
test: unittest lint tidy

.PHONY: unittest
unittest: generate
	go test -v -cover -coverprofile=coverage.txt -covermode=atomic -race ./...

.PHONY: lint
lint: generate
	golangci-lint run --verbose ./...

.PHONY: tidy
tidy: generate
	go mod tidy

.PHONY: docker.build
docker.build: generate
	docker build -t bertytech/berty .

.PHONY: generate
generate: gen.sum
gen.sum: $(PROTOS_SRC) Makefile
	md5sum -c $@ || ( \
	  set -e; \
	  GO111MODULE=on go mod vendor; \
	  docker run \
	    --user=`id -u` \
	    --volume="$(PWD)/..:/go/src/berty.tech" \
	    --workdir="/go/src/berty.tech/go" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:16 \
	    -xec 'make generate_local' \
	)
	touch $@

.PHONY: generate_local
generate_local:
	@set -e; for proto in $(PROTOS_SRC); do ( set -xe; \
	  protoc -I /protobuf:vendor:../api: --gofast_out="plugins=grpc:$(GOPATH)/src" "$$proto" \
	); done
	md5sum $(PROTOS_SRC) | sort -k2 > gen.sum
