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
	go test -v -mod=readonly ./...

.PHONY: clean
clean:
	rm -f $(PROTOS_TARGETS)
	rm -f $(LOGGER_TARGETS)

.PHONY: generate
generate: $(LOGGER_TARGETS) $(PROTOS_TARGETS)

.PHONY: logger
logger: $(LOGGER_TARGETS)

$(LOGGER_TARGETS):
	@./.scripts/generate-logger.sh "./$@"

%.pb.go: %.proto
	protoc -I . -I $(GOPATH)/src/github.com/gogo/protobuf --gofast_out="plugins=grpc:$(GOPATH)/src" "$<";
