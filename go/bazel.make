UNAME_S ?= $(shell uname -s)

ifeq ($(UNAME_S),Darwin)
BAZEL ?= /usr/local/bin/bazel

/usr/local/bin/bazel:
	brew tap bazelbuild/tap
	brew install bazelbuild/tap/bazel
endif

BAZEL ?= $(shell which bazel 2>/dev/null || echo bazel)
IBAZEL ?= $(shell which ibazel 2>/dev/null || echo ibazel)

SAMPLE_BUILD_FILE = pkg/bertyprotocol/BUILD.bazel

cmd/bertychat/BUILD.bazel $(SAMPLE_BUILD_FILE): $(BAZEL) WORKSPACE vendor
	$(BAZEL) $(BAZEL_ARGS) run $(BAZEL_CMD_ARGS) //:gazelle

.PHONY: bazel.banner
bazel.banner: $(BAZEL) vendor cmd/bertychat/BUILD.bazel
	$(BAZEL) $(BAZEL_ARGS) run $(BAZEL_CMD_ARGS) //cmd/bertychat banner

.PHONY: bazel.build
bazel.build: $(BAZEL) vendor $(SAMPLE_BUILD_FILE)
	$(BAZEL) $(BAZEL_ARGS) build $(BAZEL_CMD_ARGS) //...

.PHONY: bazel.test
bazel.test: $(BAZEL) vendor $(SAMPLE_BUILD_FILE)
	$(BAZEL) $(BAZEL_ARGS) test $(BAZEL_CMD_ARGS) //...

bazel.watch-test:
	BAZEL=$(IBAZEL) $(MAKE) bazel.test

.PHONY: bazel.clean
bazel.clean: $(BAZEL)
	rm -fr */**/BUILD.bazel
	$(BAZEL) clean

.PHONY: bazel.expunge
bazel.expunge: $(BAZEL)
	rm -fr */**/BUILD.bazel
	$(BAZEL) clean --expunge


.PHONY: bazel.re
bazel.re: bazel.clean
	$(MAKE) bazel.build
