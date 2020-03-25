##
## Config
##

BAZEL ?= bazel
BAZEL_ARGS ?=
BAZEL_CMD_ARGS ?=
GO ?= go
GO_TEST_OPTS ?= -test.timeout=180s
GOPATH ?= $(HOME)/go
IBAZEL ?= ibazel --run_output_interactive=false --run_output
USE_IBAZEL ?= false
BAZEL_WRAPPER ?= $(BAZEL)

ifeq ($(USE_IBAZEL),true)
BAZEL_WRAPPER=$(IBAZEL)
endif

##
## Functions
##

bazel = $(BAZEL_WRAPPER) $(BAZEL_ARGS) $(1) $(BAZEL_CMD_ARGS) $(2)
check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "No $(exec) in PATH")))

##
## General rules
##

.PHONY: install
install: go.install

.PHONY: build
build: bazel.build

.PHONY: run
run: bazel.daemon

.PHONY: dev
dev: ibazel.daemon

.PHONY: test
test: unittest lint tidy

.PHONY: lint
lint: go.lint

.PHONY: autotest
autotest: ibazel.unittest

.PHONY: unittest
unittest: go.unittest

.PHONY: generate
generate: pb.generate

.PHONY: tidy
tidy: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) mod tidy

.PHONY: docker.build
docker.build: pb.generate
	$(call check-program, docker)
	docker build -t bertytech/berty ..

.PHONY: docker.fast
docker.fast: args ?= -h
docker.fast: run_opts ?=
docker.fast: pb.generate
	$(call check-program, $(GO) docker)
	@mkdir -p out
	GOOS=linux GOARCH=amd64 GO111MODULE=on $(GO) build -v -o ./out/berty-linux-static ./cmd/berty
	docker run -it --rm -v $(PWD)/out/berty-linux-static:/bin/berty $(run_opts) ubuntu berty $(args)

.PHONY: clean
clean: pb.clean bazel.clean
	rm -rf vendor/ out/

.PHONY: fclean
fclean: clean bazel.fclean

.PHONY: re
re: clean build

##
## Go rules (without bazel)
##

.PHONY: go.lint
go.lint: pb.generate
	$(call check-program, golangci-lint)
	golangci-lint run --timeout=120s --verbose ./...

.PHONY: go.unittest
go.unittest: GO_TEST_PATH ?= ./...
go.unittest: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) test $(GO_TEST_OPTS) -cover -coverprofile=coverage.txt -covermode=atomic -race $(GO_TEST_PATH)

.PHONY: go.unittest.watch
go.unittest: GO_TEST_PATH ?= ./...
go.unittest.watch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	while true; \
		do clear; \
		GO_TEST_PATH=$(GO_TEST_PATH) make go.unittest; \
		watchman-wait . -p "**/*.go"; \
	done

.PHONY: go.install
go.install: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) install -v ./cmd/...

##
## Bazel rules
##

SAMPLE_GAZELLE_GENERATED_FILE ?= pkg/bertyprotocol/BUILD.bazel # should be the path of a git-ignored bazel-generated file
VENDOR_BAZEL_OVERRIDEN_FILES = ../vendor/github.com/libp2p/go-openssl/BUILD.bazel


.PHONY: bazel.lint
bazel.lint: pb.generate
	$(call check-program, $(BAZEL))
	$(BAZEL_WRAPPER) $(BAZEL_ARGS) run //:golangcilint

.PHONY: bazel.build
bazel.build: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, build, //...)

.PHONY: bazel.daemon
bazel.daemon: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //cmd/berty -- daemon)

.PHONY: bazel.demo
bazel.demo: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //cmd/berty -- demo)

.PHONY: bazel.mini
bazel.mini: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //cmd/berty -- mini)

.PHONY: bazel.banner
bazel.banner: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //cmd/berty -- banner)

.PHONY: bazel.unittest
bazel.unittest: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, test, --test_output=streamed //...)

.PHONY: bazel.rdvp
bazel.rdvp: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //cmd/rdvp -- serve)


.PHONY: bazel.generate
bazel.generate: pb.generate $(SAMPLE_GAZELLE_GENERATED_FILE)

.PHONY: bazel.clean
bazel.clean:
	rm -rf {internal,cmd,pkg}/**/BUILD.bazel

.PHONY: bazel.clean
bazel.fclean:
	$(call check-program, $(BAZEL))
	$(BAZEL) clean --expunge
	rm -rf {internal,cmd,pkg}/**/BUILD.bazel

##
## ibazel
##

.PHONY: ibazel.daemon
ibazel.daemon: bazel.generate
	USE_IBAZEL=true make bazel.daemon

.PHONY: ibazel.daemon
ibazel.demo: bazel.generate
	USE_IBAZEL=true make bazel.demo

.PHONY: ibazel.mini
ibazel.mini: bazel.generate
	USE_IBAZEL=true make bazel.mini

.PHONY: ibazel.build
ibazel.build: bazel.generate
	USE_IBAZEL=true make bazel.build

.PHONY: ibazel.banner
ibazel.banner: bazel.generate
	USE_IBAZEL=true make bazel.banner

.PHONY: ibazel.unittest
ibazel.unittest: bazel.generate
	USE_IBAZEL=true make bazel.unittest

##
## Deps
##

../vendor/github.com/libp2p/go-openssl/BUILD.bazel: $(abspath ../build/bazel/com_github_libp2p_go_openssl.BUILD.bzl) ../vendor
	cp $< $@

$(SAMPLE_GAZELLE_GENERATED_FILE): WORKSPACE ../vendor $(VENDOR_BAZEL_OVERRIDEN_FILES)
	$(call check-program, $(BAZEL))
	$(BAZEL) $(BAZEL_ARGS) run $(BAZEL_CMD_ARGS) //:gazelle

../vendor: ../go.mod
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) mod vendor
	touch $@

##
## Code gen
##

PROTOS_SRC := $(wildcard ../api/*.proto) $(wildcard ../api/go-internal/*.proto)
GEN_SRC := $(PROTOS_SRC) Makefile
GEN_SUM := gen.sum

.PHONY: pb.clean
pb.clean:
	rm -f gen.sum $(wildcard */*/*.pb.go) $(wildcard */*/*pb_test.go)

.PHONY: pb.generate
pb.generate: gen.sum
$(GEN_SUM): $(GEN_SRC)
	$(call check-program, shasum docker $(GO))
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	@diff -q $(GEN_SUM).tmp $(GEN_SUM) || ( \
	  uid=`id -u`; \
	  set -xe; \
	  $(GO) mod vendor; \
	  docker run \
	    --user="$$uid" \
	    --volume="$(PWD)/..:/go/src/berty.tech/berty" \
	    --workdir="/go/src/berty.tech/berty/go" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:22 \
	    -xec 'make generate_local'; \
	    $(MAKE) tidy \
	)

PROTOC_OPTS = -I ../vendor/github.com/grpc-ecosystem/grpc-gateway:../api:../vendor:/protobuf
.PHONY: generate_local
generate_local:
	$(call check-program, goimports shasum protoc)
	@set -e; for proto in $(PROTOS_SRC); do ( set -xe; \
	  protoc $(PROTOC_OPTS) --gogo_out="plugins=grpc:$(GOPATH)/src" "$$proto" \
	); done
	goimports -w ./pkg ./cmd ./internal
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	mv $(GEN_SUM).tmp $(GEN_SUM)

##
## Dev
##

print-%:
	@echo $*: $($*)
