rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
GOPATH ?= $(HOME)/go
BIN = $(GOPATH)/bin/berty
SOURCES = $(call rwildcard, $(CODE_PATHS), *.go)
CODE_PATHS = $(filter-out node_modules/,$(wildcard */))
PROTOS = $(call rwildcard, $(CODE_PATHS), *.proto)
SERVICE_PROTOS = $(call rwildcard, api, *.proto)
GENERATED_FILES = \
	$(patsubst %.proto,%.pb.go,$(PROTOS)) \
	api/node/service.graphql \
	api/client/berty.node.service.gen.go \
	$(call rwildcard $(CODE_PATHS), *.gen.go) \
	api/p2p/kind.gen.go
PROTOC_OPTS = --proto_path=../vendor:../vendor/github.com/gogo/protobuf:.
CGO_LDFLAGS ?= -L/usr/local/opt/openssl/lib
CGO_CPPFLAGS ?= -I/usr/local/opt/openssl/include
BUILD_ENV ?= CGO_LDFLAGS="$(CGO_LDFLAGS)" CGO_CPPFLAGS="$(CGO_CPPFLAGS)"
RUN_DAEMON_OPTS ?= --log-level=debug
TEST_PATHS ?= ./...
TEST_CMD ?= $(BUILD_ENV) go test -test.timeout 3m -v $(TEST_PATHS)
PROTOC ?= protoc
DOCKER_PROTOC = docker run --user="$(shell id -u)" --rm -v "$(GOPATH)/src:$(GOPATH)/src" -v "$(PWD)/..:$(PWD)/.." -w "$(PWD)" bertychat/protoc
ifeq (, $(shell which protoc))
PROTOC=$(DOCKER_PROTOC)
endif
ifeq (1, $(USE_DOCKER))
PROTOC=$(DOCKER_PROTOC)
endif

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

$(BIN): generate $(SOURCES)
	$(BUILD_ENV) go install -v ./cmd/...

.PHONY: testwatch
testwatch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	  clear; $(TEST_CMD); \
	  while true; do watchman-wait . -p "**/*.go"; clear; $(TEST_CMD); sleep .3; done

.PHONY: test
test: generate
	$(TEST_CMD)

.PHONY: integration
integration: install
	rm -f /tmp/berty.integration.db
	@# initialize a new daemon on a fresh db
	$(BIN) daemon --init-only --no-p2p --sql-path=/tmp/berty.integration.db
	@# initialize a new daemon based on an existing db
	$(BIN) daemon --init-only --no-p2p --sql-path=/tmp/berty.integration.db

.PHONY: lint
lint: generate
	gometalinter.v2 --config=../.gometalinter.json $(TEST_PATHS)

.PHONY: clean
clean:
	rm -f $(GENERATED_FILES) $(BIN)

.PHONY: generate
generate: $(GENERATED_FILES)

.PHONY: _ci_prepare
_ci_prepare:
	@# touching files to avoid regenerating files based on modification date
	touch $(GENERATED_FILES)

.PHONY: dev-deps
dev-deps:
	go get -u -v \
	  github.com/gogo/protobuf/proto \
	  github.com/gogo/protobuf/protoc-gen-gogo \
	  github.com/gogo/protobuf/gogoproto \
	  github.com/gogo/protobuf/protoc-gen-gofast \
	  github.com/gogo/protobuf/jsonpb \
	  github.com/moul/protoc-gen-gotemplate \
	  golang.org/x/tools/cmd/goimports \
		github.com/99designs/gqlgen \
		github.com/vektah/gorunpkg

##
## file-based rules
##

%.pb.go: %.proto
	$(PROTOC) $(PROTOC_OPTS) --gofast_out=plugins=grpc:"$(GOPATH)/src" "$(dir $<)"/*.proto

# FIXME: use an automated rule that matches every client generated files
api/client/berty.node.service.gen.go: $(PROTOS)
	@# FIXME: implement `uniq` in make
	@set -e; for protodir in `echo $(dir $(SERVICE_PROTOS)) | tr " " "\n" | uniq`; do (set -xe; \
	  $(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=true,all=false,single-package-mode=true,template_dir=./api/client:./api/client $$protodir/*.proto; \
	); done
	goimports -w ./api/client

api/p2p/kind.gen.go: $(PROTOS)
	$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=false,single-package-mode=true,all=true,template_dir=./api/p2p:./api/p2p ./api/p2p/kind.proto
	goimports -w ./api/p2p

api/node/service.graphql: $(PROTOS)
	$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=false,all=true,template_dir=./api/node:./api/node/graphql ./api/node/service.proto
	cd ./api/node/graphql && gqlgen -v gen

