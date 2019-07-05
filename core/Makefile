rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
NAME ?= berty
# FIXME: create a everythingButVendor helper that runs a wildcard but ignores node_modules/ and vendor/, and simplify variables below
GOPATH ?= $(HOME)/go
BIN ?= $(GOPATH)/bin/berty
BUILD_MODE ?= dev
SOURCES = $(call rwildcard, ./, *.go)
OUR_SOURCES = $(filter-out $(call rwildcard,./vendor/, *.go),$(SOURCES))
PROTOS = $(strip $(call rwildcard, ./, *.proto))
OUR_PROTOS = $(filter-out $(call rwildcard,./vendor/, *.proto),$(PROTOS))
PROTOC_OPTS = --proto_path=/protobuf:./vendor/berty.tech:./vendor/github.com/gogo/protobuf:vendor:.
SERVICE_PROTOS = $(call rwildcard, api, *.proto)
GENERATED_PATTERNS = %.validate.gen.go %.service.gen.go %generated.gen.go %kind.gen.go %.pb.go %.gen.js
GENERATED_FILES = $(filter $(GENERATED_PATTERNS),$(filter-out $(call rwildcard ./vendor/,*),$(call rwildcard,./,*)))
GENERATION_TARGETS = .kind.generated .client.generated .pb.generated
CGO_LDFLAGS ?= -L/usr/local/opt/openssl/lib
CGO_CPPFLAGS ?= -I/usr/local/opt/openssl/include
BUILD_ENV ?= GO111MODULE=on GOPROXY=https://goproxy.berty.io CGO_LDFLAGS="$(CGO_LDFLAGS)" CGO_CPPFLAGS="$(CGO_CPPFLAGS)"
GIT_SHA ?= $(shell git rev-parse HEAD)
GIT_TAG ?= $(shell git describe --tags --always)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT_DATE ?= $(shell git show -s --format=%ct $(GIT_SHA))
GO_ROOT_PKG ?= berty.tech/core
EXT_LDFLAGS ?= -ldflags "-X $(GO_ROOT_PKG).GitSha=$(GIT_SHA) -X $(GO_ROOT_PKG).GitTag=$(GIT_TAG) -X $(GO_ROOT_PKG).GitBranch=$(GIT_BRANCH) -X $(GO_ROOT_PKG).BuildMode=$(BUILD_MODE) -X $(GO_ROOT_PKG).commitDate=$(GIT_COMMIT_DATE)"
RUN_DAEMON_OPTS ?= --log-level=debug --notification
TEST_PATHS ?= ./...
TEST_OPTS ?= -v
TEST_TIMEOUT ?= 3m
TEST_CMD ?= go test -test.timeout $(TEST_TIMEOUT) $(TEST_OPTS) $(TEST_PATHS)
PROTOC ?= protoc
GIN_OPTS ?= --immediate --port=2999 --appPort=1337 --build=./cmd/berty --excludeDir vendor
RN_PATH ?= ../client/react-native

##
## phonies
##

.PHONY: help
help:
	@echo "Core commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

.PHONY: callvis
callvis:
	cd $$GOPATH/src/berty.tech/core/cmd/berty && $(BUILD_ENV) GO111MODULE=auto go-callvis \
		-nostd \
		-group=pkg,type \
		-focus=berty.tech/core/cmd/berty \
		-ignore=berty.tech/core/vendor/go.uber.org,berty.tech/core/pkg/tracing,berty.tech/core/vendor/github.com,berty.tech/core/vendor/golang.org,berty.tech/core/vendor/google.golang.org,berty.tech/core/vendor/gopkg.in \
		.
		# -include=berty.tech/core/vendor/github.com/libp2p \

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
	while true; do clear; $(BUILD_ENV) $(TEST_CMD); sleep .3; watchman-wait . -p "**/*.go";  done

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
	$(BIN) daemon --init-only --no-p2p --sql-name=berty.integration.db
	@# initialize a new daemon based on an existing db
	$(BIN) daemon --init-only --no-p2p --sql-name=berty.integration.db

.PHONY: lint
lint: generate
	$(BUILD_ENV) golangci-lint run $(TEST_PATHS)

.PHONY: generate
generate: .generated

.generated: $(PROTOS)
	make generate_prepare
	docker run \
		--volume="$(PWD)/..:/go/src/berty.tech" \
		--workdir="/go/src/$(GO_ROOT_PKG)" \
		--entrypoint="sh" \
		--rm \
		bertychat/protoc:v11 \
		-xec 'make generate_local'
	touch $@

.PHONY: clean
clean:
	rm -f .generated $(GENERATED_FILES) $(GENERATION_TARGETS) $(BIN)
	rm -rf vendor
	@# FIXME: investigate
	rm -rf google gogoproto github.com google.golang.org

.PHONY: generate_local
generate_local: $(GENERATION_TARGETS)
	@# FIXME: investigate why (sometimes?) there are "github.com" and "google.golang.org" directories generated at the root of core/
	rm -rf google gogoproto github.com google.golang.org

	goimports -w `find . -name "*.pb.go" -or -name "*.gen.go" | grep -v /vendor/`
	gofmt -w -s `find . -name "*.pb.go" -or -name "*.gen.go" | grep -v /vendor/`

.PHONY: generate_prepare
generate_prepare:
	$(BUILD_ENV) go mod vendor

.PHONY: _ci_prepare
_ci_prepare:
	@# touching files to avoid regenerating files based on modification date
	touch $(PROTOS) $(SOURCES)
	sleep 1
	touch .generated $(GENERATION_TARGETS)

##
## file-based rules
##

%.pb.go: %.proto
	$(PROTOC) $(PROTOC_OPTS) \
		--gofast_out="plugins=grpc:$(GOPATH)/src" \
		--gotemplate_out=debug=false,all=true,single-package-mode=false,template_dir=./pkg/validate:. \
		"$(dir $<)"/*.proto

%.pb.json: %.proto
	mkdir -p "$(dir ../client/react-native/app/bridge/service/$@)"
	pbjs \
		--path /protobuf \
		--path vendor/github.com/gogo/protobuf/ \
		--path vendor/berty.tech \
		--path vendor \
		--path $(GOPATH)/src/berty.tech/core \
		--path . \
		-t json \
		"./$<" > ../client/react-native/app/bridge/service/$@

# FIXME: use an automated rule that matches every client generated files
.client.generated: $(PROTOS)
	$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=false,all=true,template_dir=./api/node:./api/node ./api/node/service.proto
	@# FIXME: implement `uniq` in make
	@set -e; for protodir in `echo $(dir $(SERVICE_PROTOS)) | tr " " "\n" | uniq`; do (set -xe; \
		$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=false,all=false,single-package-mode=true,template_dir=./api/client:./api/client $$protodir/*.proto; \
	); done
	@# FIXME: the following hack is due to goimports -w not deleting duplicated imports
	goimports -w ./api/client/
	sed -i'' '/^$$/d' api/client/*.gen.go api/client/jsonclient/*.gen.go
	goimports -w ./api/client/*.gen.go ./api/client/jsonclient/*.gen.go
	sed -i'' '/^$$/d' api/client/*.gen.go api/client/jsonclient/*.gen.go
	goimports -w ./api/client/*.gen.go ./api/client/jsonclient/*.gen.go
	# generate grpc service
	pbhbs \
		--template-dir $(RN_PATH)/app/template \
		--proto-path /protobuf \
		--proto-path vendor/berty.tech \
		--proto-path vendor/github.com/gogo/protobuf/ \
		--proto-path vendor \
		--proto-path $(GOPATH)/src/berty.tech/core \
		--output-dir $(RN_PATH)/app \
		--helper-dir $(RN_PATH)/app/template/helper \
		./api/node/service.proto
	# prettify files
	cd $(RN_PATH) && make gen.pretty
	touch $@

.kind.generated: $(PROTOS)
	$(PROTOC) $(PROTOC_OPTS) --gotemplate_out=debug=false,single-package-mode=true,all=true,template_dir=./entity:./entity ./entity/kind.proto
	goimports -w ./entity
	touch $@

.pb.generated: $(patsubst %.proto,%.pb.go,$(OUR_PROTOS)) $(patsubst %.proto,%.pb.json,$(OUR_PROTOS))
	rm -rf google/ # remove directory generated by protoc-gen-gotemplate for proto deps
	touch $@


displayprotos:
	@echo $(PROTOS)
