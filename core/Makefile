rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
GOPATH ?= $(HOME)/go
BIN = $(GOPATH)/bin/berty
CODE_PATHS = $(filter-out node_modules/,$(wildcard */))
PROTOS = $(call rwildcard, $(CODE_PATHS), *.proto)
GENERATED_FILES = $(patsubst %.proto,%.pb.go,$(PROTOS))
PROTOC_OPTS = --proto_path=../vendor:../vendor/github.com/gogo/protobuf:.
CGO_LDFLAGS ?= -L/usr/local/opt/openssl/lib
CGO_CPPFLAGS ?= -I/usr/local/opt/openssl/include
BUILD_ENV ?= CGO_LDFLAGS="$(CGO_LDFLAGS)" CGO_CPPFLAGS="$(CGO_CPPFLAGS)"
RUN_DAEMON_OPTS ?= --log-level=debug

.PHONY: all
all: run

.PHONY: run
run: $(BIN)
	$(BIN) daemon $(RUN_DAEMON_OPTS)

.PHONY: install
install: $(BIN)

$(BIN): $(GENERATED_FILES)
	$(BUILD_ENV) go install -v ./cmd/...

.PHONY: test
test: generate
	$(BUILD_ENV) go test -test.timeout 30s -v ./...

%.pb.go: %.proto
	protoc $(PROTOC_OPTS) --gofast_out=plugins=grpc:"$(GOPATH)/src" "$(dir $<)"/*.proto

.PHONY: clean
clean:
	rm -f $(GENERATED_FILES) $(BIN)

.PHONY: generate
generate: $(GENERATED_FILES)

.PHONY: _ci_prepare
_ci_prepare:
	@# touching files to avoid regenerating files based on modification date
	touch $(GENERATED_FILES)
