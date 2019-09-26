.PHONY: bazel.build
bazel.build:
	bazel build //api/...

.PHONY: bazel.clean
bazel.clean:
	bazel clean

.PHONY: bazel.expunge
bazel.expunge:
	bazel clean --expunge

.PHONY: bazel.re
bazel.re: bazel.expunge
	$(MAKE) bazel.build
