BAZEL_BUILD=bazel $(BAZEL_ARGS) build $(BAZEL_CMD_ARGS)

.PHONY: bazel.banner
bazel.banner:
	bazel $(BAZEL_ARGS) run $(BAZEL_CMD_ARGS) //go/cmd/bertychat banner

.PHONY: bazel.build
bazel.build:
	$(BAZEL_BUILD) //api/... //go/...
	cd test/experiment && $(BAZEL_BUILD) //dht/...

.PHONY: bazel.test
bazel.test:
	bazel $(BAZEL_ARGS) test $(BAZEL_CMD_ARGS) //api/... //go/...

.PHONY: bazel.clean
bazel.clean:
	bazel clean

.PHONY: bazel.expunge
bazel.expunge:
	bazel clean --expunge

.PHONY: bazel.re
bazel.re: bazel.expunge
	$(MAKE) bazel.build
