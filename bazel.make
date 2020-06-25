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


SAMPLE_GAZELLE_GENERATED_FILE ?= pkg/bertyprotocol/BUILD.bazel # should be the path of a git-ignored bazel-generated file
VENDOR_BAZEL_OVERRIDDEN_FILES = vendor/github.com/libp2p/go-openssl/BUILD.bazel

##
## Main
##

.PHONY: bazel.build
bazel.build: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, build, //go/...)

.PHONY: bazel.daemon
bazel.daemon: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //go/cmd/berty -- daemon)

.PHONY: bazel.mini
bazel.mini: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //go/cmd/berty -- mini)

.PHONY: bazel.banner
bazel.banner: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //go/cmd/berty -- banner)

.PHONY: bazel.unittest
bazel.unittest: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, test, --cache_test_results=no --test_output=streamed //go/...)

.PHONY: bazel.rdvp
bazel.rdvp: bazel.generate
	$(call check-program, $(BAZEL))
	$(call bazel, run, //go/cmd/rdvp -- serve)


.PHONY: bazel.generate
bazel.generate: pb.generate $(SAMPLE_GAZELLE_GENERATED_FILE)

.PHONY: bazel.clean
bazel.clean:
	rm -rf go/{internal,cmd,pkg}/**/BUILD.bazel

.PHONY: bazel.clean
bazel.fclean:
	$(call check-program, $(BAZEL))
	$(BAZEL) clean --expunge
	rm -rf go/{internal,cmd,pkg}/**/BUILD.bazel

##
## ibazel
##

.PHONY: ibazel.daemon
ibazel.daemon: bazel.generate
	USE_IBAZEL=true make bazel.daemon

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

vendor/github.com/libp2p/go-openssl/BUILD.bazel: build/bazel/com_github_libp2p_go_openssl.BUILD.bzl vendor
	cp $< $@

$(SAMPLE_GAZELLE_GENERATED_FILE): WORKSPACE vendor $(VENDOR_BAZEL_OVERRIDDEN_FILES)
	$(call check-program, $(BAZEL))
	$(BAZEL) $(BAZEL_ARGS) run $(BAZEL_CMD_ARGS) //:gazelle

vendor: go.mod
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) mod vendor
	touch $@

.PHONY: tidy
tidy: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) mod tidy

.PHONY: pb.generate
pb.generate:
	cd go; make pb.generate
