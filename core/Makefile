rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
GOPATH ?= $(HOME)/go
BIN = $(GOPATH)/bin/berty
SOURCES = $(call rwildcard, $(CODE_PATHS), *.go)
CODE_PATHS = $(filter-out node_modules/,$(wildcard */))
PROTOS = $(call rwildcard, $(CODE_PATHS), *.proto)
SERVICE_PROTOS = $(call rwildcard, api, *.proto)
GENERATED_FILES = $(patsubst %.proto,%.pb.go,$(PROTOS)) client/berty.node.service.gen.go $(call rwildcard $(CODE_PATHS), *.gen.go)
PROTOC_OPTS = --proto_path=../vendor:../vendor/github.com/gogo/protobuf:.
CGO_LDFLAGS ?= -L/usr/local/opt/openssl/lib
CGO_CPPFLAGS ?= -I/usr/local/opt/openssl/include
BUILD_ENV ?= CGO_LDFLAGS="$(CGO_LDFLAGS)" CGO_CPPFLAGS="$(CGO_CPPFLAGS)"
RUN_DAEMON_OPTS ?= --log-level=debug

##
## phonies
##

.PHONY: all
all: run

.PHONY: run
run: $(BIN)
	$(BIN) daemon $(RUN_DAEMON_OPTS)

.PHONY: install
install: $(BIN)

$(BIN): $(GENERATED_FILES) $(SOURCES)
	$(BUILD_ENV) go install -v ./cmd/...

.PHONY: test
test: generate
	$(BUILD_ENV) go test -test.timeout 30s -v ./...

.PHONY: clean
clean:
	rm -f $(GENERATED_FILES) $(BIN)

.PHONY: generate
generate: $(GENERATED_FILES)

.PHONY: _ci_prepare
_ci_prepare:
	@# touching files to avoid regenerating files based on modification date
	touch $(GENERATED_FILES)

##
## file-based rules
##

%.pb.go: %.proto
	protoc $(PROTOC_OPTS) --gofast_out=plugins=grpc:"$(GOPATH)/src" "$(dir $<)"/*.proto

# FIXME: use an automated rule that matches every client generated files
client/berty.node.service.gen.go: $(PROTOS)
	@# FIXME: implement `uniq` in make
	@set -e; for protodir in `echo $(dir $(SERVICE_PROTOS)) | tr " " "\n" | uniq`; do (set -xe; \
	  protoc $(PROTOC_OPTS) --gotemplate_out=debug=false,all=false,single-package-mode=true,template_dir=./client:./client $$protodir/*.proto; \
	); done
	goimports -w ./client/
