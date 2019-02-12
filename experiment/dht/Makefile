BUILD_ENV ?= GO111MODULE=on
TEST_PATHS ?= ./...
TEST_OPTS ?= -v
TEST_TIMEOUT ?= 3m
TEST_CMD ?= go test -test.timeout $(TEST_TIMEOUT) $(TEST_OPTS) $(TEST_PATHS)

.PHONY: testwatch
testwatch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	clear; $(BUILD_ENV) $(TEST_CMD); \
	while true; do watchman-wait . -p "**/*.go"; clear; $(BUILD_ENV) $(TEST_CMD); sleep .3; done

.PHONY: test
test:
	$(BUILD_ENV) $(TEST_CMD)
