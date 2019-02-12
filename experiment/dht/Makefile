BUILD_ENV ?= GO111MODULE=on
TEST_PATHS ?= ./...
TEST_OPTS ?= -v
TEST_TIMEOUT ?= 3m
TEST_CMD ?= go test -test.timeout $(TEST_TIMEOUT) $(TEST_OPTS) $(TEST_PATHS)

.PHONY: deps.opendht
deps.opendht:
	brew install gnutls msgpack
	mkdir -p $$GOPATH/src/github/savoirfairelinux
	git clone --branch=1.8.1 git@github.com:savoirfairelinux/opendht $$GOPATH/src/github.com/savoirfairelinux/opendht


.PHONY: deps.golang
deps.golang:
	[ -e $$GOPATH/src ]

.PHONY: deps
deps: deps.golang deps.opendht

.PHONY: testwatch
testwatch: deps
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	clear; $(BUILD_ENV) $(TEST_CMD); \
	while true; do watchman-wait . -p "**/*.go"; clear; $(BUILD_ENV) $(TEST_CMD); sleep .3; done

.PHONY: test
test: deps
	$(BUILD_ENV) $(TEST_CMD)
