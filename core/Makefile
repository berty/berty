rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
GOPATH ?= $(HOME)/go
BIN = $(GOPATH)/bin/berty
BUILD_MODE ?= dev
SOURCES = $(call rwildcard, $(CODE_PATHS), *.go)
OUR_SOURCES = $(filter-out $(call rwildcard,vendor//, *.go),$(SOURCES))
CODE_PATHS = $(filter-out node_modules/,$(wildcard */))
PROTOS = $(call rwildcard, $(CODE_PATHS), *.proto)
OUR_PROTOS = $(filter-out $(call rwildcard,vendor//, *.proto),$(PROTOS))
PROTOC_OPTS = --proto_path=/protobuf:./vendor/github.com/gogo/protobuf:vendor:.
SERVICE_PROTOS = $(call rwildcard, api, *.proto)
GENERATED_FILES = \
	$(call rwildcard $(CODE_PATHS), *.gen.go) \
	$(call rwildcard $(CODE_PATHS), *.pb.go) \
	$(call rwildcard $(CODE_PATHS), *.gen.js) \
	$(call rwildcard $(CODE_PATHS), *.gen.graphql)
GENERATION_TARGETS = \
	.client.generated \
	.gql.generated \
	.kind.generated \
	$(patsubst %.proto,%.pb.go,$(OUR_PROTOS))

CGO_LDFLAGS ?= -L/usr/local/opt/openssl/lib
CGO_CPPFLAGS ?= -I/usr/local/opt/openssl/include
BUILD_ENV ?= GO111MODULE=on CGO_LDFLAGS="$(CGO_LDFLAGS)" CGO_CPPFLAGS="$(CGO_CPPFLAGS)"
GIT_SHA ?= $(shell git rev-parse HEAD)
GIT_TAG ?= $(shell git describe --tags --always)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT_DATE ?= $(shell git show -s --format=%ct $(GIT_SHA))
EXT_LDFLAGS ?= -ldflags "-X berty.tech/core.GitSha=$(GIT_SHA) -X berty.tech/core.GitTag=$(GIT_TAG) -X berty.tech/core.GitBranch=$(GIT_BRANCH) -X berty.tech/core.BuildMode=$(BUILD_MODE) -X berty.tech/core.commitDate=$(GIT_COMMIT_DATE)"
RUN_DAEMON_OPTS ?= --log-level=debug
TEST_PATHS ?= ./...
TEST_OPTS ?= -v
TEST_CMD ?= go test -test.timeout 3m $(TEST_OPTS) $(TEST_PATHS)
PROTOC ?= protoc
GQLGEN ?= gqlgen
GIN_OPTS ?= --immediate --port=2999 --appPort=1337 --build=./cmd/berty --excludeDir vendor


##
## phonies
##

.PHONY: help
help:
	@echo "Core commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

.PHONY: dev
dev: install
	@if ! command -v gin &>/dev/null; then go get github.com/codegangsta/gin; fi
	$(BUILD_ENV) gin $(GIN_OPTS) run -- daemon $(RUN_DAEMON_OPTS)

.PHONY: run
run: $(BIN)
	$(BIN) daemon $(RUN_DAEMON_OPTS)

.PHONY: install
install: $(BIN)

$(BIN): generate $(OUR_SOURCES)
	$(BUILD_ENV) go install $(EXT_LDFLAGS) -v ./cmd/...

.PHONY: testwatch
testwatch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	clear; $(BUILD_ENV) $(TEST_CMD); \
	while true; do watchman-wait . -p "**/*.go"; clear; $(BUILD_ENV) $(TEST_CMD); sleep .3; done

.PHONY: test
test: generate
	$(BUILD_ENV) $(TEST_CMD)

# testloop runs test suite until it fails (without test caching)
.PHONY: testloop
testloop: generate
	@if ! command -v watchman &>/dev/null; then go get moul.io/retry; fi
	$(BUILD_ENV) retry -r $(TEST_CMD) -count 1

.PHONY: integration
integration: install
	rm -f /tmp/berty.integration.db
	@# initialize a new daemon on a fresh db
	$(BIN) daemon --init-only --no-p2p --sql-path=/tmp/berty.integration.db
	@# initialize a new daemon based on an existing db
	$(BIN) daemon --init-only --no-p2p --sql-path=/tmp/berty.integration.db

.PHONY: lint
lint: generate
	golangci-lint run $(TEST_PATHS)

.PHONY: generate
generate: .generated

.generated: $(PROTOS)
	rm -f $(GENERATED_FILES) $(GENERATION_TARGETS) $@
	make generate_prepare
	docker run \
		--user="$(shell id -u)" \
		--volume="$(PWD)/..:/go/src/berty.tech" \
		--workdir="/go/src/berty.tech/core" \
		--entrypoint="sh" \
		--rm \
		bertychat/protoc:v4 \
		-xec 'make generate_local'
	touch $@

.PHONY: clean
clean:
	rm -f .generated $(GENERATED_FILES) $(GENERATION_TARGETS) $(BIN)

.PHONY: generate_local
generate_local: $(GENERATION_TARGETS)

.PHONY: generate_prepare
generate_prepare:
	$(BUILD_ENV) go mod vendor

.PHONY: _ci_prepare
_ci_prepare:
	@# touching files to avoid regenerating files based on modification date
	touch $(PROTOS) $(SOURCES)
	sleep 1
	touch .generated

.PHONY: dev-deps
dev-deps:
	go get -u -v \
		github.com/gogo/protobuf/proto \
		github.com/gogo/protobuf/protoc-gen-gogo \
		github.com/gogo/protobuf/gogoproto \
		github.com/gogo/protobuf/protoc-gen-gofast \
		github.com/gogo/protobuf/jsonpb \
		moul/protoc-gen-gotemplate \
		golang.org/x/tools/cmd/goimports \
		github.com/99designs/gqlgen \
		github.com/99designs/gorunpkg

##
## file-based rules
##

%.pb.go: %.proto
	$(PROTOC) $(PROTOC_OPTS) --gofast_out=plugins=grpc:"$(GOPATH)/src" "$(dir $<)"/*.proto

# FIXME: use an automated rule that matches every client generated files
.client.generated: $(PROTOS)
	@# FIXME: implement `uniq` in make
	@set -e; for protodir in `echo $(dir $(SERVICE_PROTOS)) | tr " " "\n" | uniq`; do (set -xe; \
		$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=true,all=false,single-package-mode=true,template_dir=./api/client:./api/client $$protodir/*.proto; \
	); done

	@# FIXME: the following hack is due to goimports -w not deleting duplicated imports
	goimports -w ./api/client
	sed -i'' '/^$$/d' api/client/*.gen.go api/client/jsonclient/*.gen.go
	goimports -w ./api/client
	sed -i'' '/^$$/d' api/client/*.gen.go api/client/jsonclient/*.gen.go
	goimports -w ./api/client
	touch $@

.kind.generated: $(PROTOS)
	$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=false,single-package-mode=true,all=true,template_dir=./api/p2p:./api/p2p ./api/p2p/kind.proto
	goimports -w ./api/p2p
	touch $@

.gql.generated: $(PROTOS)
	mkdir -p ./api/node/graphql
	$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=false,all=true,template_dir=./api/node:./api/node/graphql ./api/node/service.proto
	goimports -w ./api/node/graphql
	cd ./api/node/graphql && $(GQLGEN) -c gqlgen.gen.yml -v gen
	cp ./api/node/graphql/service.gen.graphql  ../client/react-native/common/schema.graphql
	prettier-eslint --trailing-comma all --single-quote --no-semi --write ./api/node/graphql/enums.gen.js
	cp ./api/node/graphql/enums.gen.js ../client/react-native/common/graphql/enums.gen.js
	touch $@
