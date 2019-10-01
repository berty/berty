BAZEL_BUILD=bazel $(BAZEL_ARGS) build $(BAZEL_CMD_ARGS)

ifeq ($(UNAME_S),Darwin)
BAZEL = /usr/local/bin/bazel

$(BAZEL):
	brew tap bazelbuild/tap
	brew install bazelbuild/tap/bazel
endif

BAZEL ?= $(shell which bazel 2>/dev/null || echo bazel)

.PHONY: bazel.banner
bazel.banner: $(BAZEL)
	$(BAZEL) $(BAZEL_ARGS) run $(BAZEL_CMD_ARGS) //go/cmd/bertychat banner

.PHONY: bazel.build
bazel.build:
	$(BAZEL_BUILD) //api/... //go/...
	cd test/experiment && $(BAZEL_BUILD) //dht/...

.PHONY: bazel.test
bazel.test:
	bazel $(BAZEL_ARGS) test $(BAZEL_CMD_ARGS) //api/... //go/...

.PHONY: bazel.clean
bazel.clean: $(BAZEL)
	$(BAZEL) clean

.PHONY: bazel.expunge
bazel.expunge: $(BAZEL)
	$(BAZEL) clean --expunge

.PHONY: bazel.re
bazel.re: bazel.expunge
	$(MAKE) bazel.build
