PROTOS = $(shell find . -name '*.proto' -not -path './vendor/*')
PACKAGES = $(shell find . -name '*.go' -not -path './vendor/*' -exec dirname {} \; | sort | uniq)
PROTOS_TARGETS = $(patsubst %.proto,%.pb.go,$(PROTOS))
LOGGER_TARGETS = $(patsubst %,%/logger.gen.go,$(PACKAGES))
GOPATH ?= $(HOME)/go

.PHONY: all
all: test lint

.PHONY: lint
lint:
	golangci-lint run

.PHONY: test
test:
	GO111MODULE=on go test -v -mod=readonly ./...

.PHONY: clean
clean:
	rm -f $(PROTOS_TARGETS)
	rm -f $(LOGGER_TARGETS)

.PHONY: generate
generate: logger proto

.PHONY: logger
logger: $(LOGGER_TARGETS)

.PHONY: logger
logger: $(LOGGER_TARGETS)

$(LOGGER_TARGETS):
	@./.scripts/generate-logger.sh "./$@"

.PHONY: proto
proto: $(PROTOS_TARGETS)

%.pb.go: %.proto
	protoc -I . -I $(GOPATH)/src/github.com/gogo/protobuf --gofast_out="plugins=grpc:$(GOPATH)/src" "$<";
