OPENDHT_PATH ?= $$PWD/src/opendht
MATRIX_PATH ?= $$PWD/src/matrix

CGO_LDFLAGS ?=
CGO_CPPFLAGS ?=

BUILD_ENV ?= GO111MODULE=auto CGO_LDFLAGS="$(CGO_LDFLAGS)" CGO_CPPFLAGS="$(CGO_CPPFLAGS)"
TEST_PATHS ?= ./test/...
TEST_OPTS ?= -v
TEST_TIMEOUT ?= 3m
TEST_CMD ?= go test -test.timeout $(TEST_TIMEOUT) $(TEST_OPTS) $(TEST_PATHS)

.PHONY: deps.opendht
deps.opendht:
	# from https://github.com/savoirfairelinux/opendht/wiki/Build-the-library
	brew install gnutls msgpack swig
	mkdir -p $$GOPATH/src/github/savoirfairelinux
	[ -e $$GOPATH/src/github.com/savoirfairelinux/opendht ] \
			|| git clone git@github.com:savoirfairelinux/opendht $$GOPATH/src/github.com/savoirfairelinux/opendht
	cd $$GOPATH/src/github.com/savoirfairelinux/opendht \
		&& git checkout tags/1.8.1 \
		&& ./autogen.sh \
		&& ./configure --prefix=/usr/local --disable-python \
		&& make \
		&& make install
	ln -s $$GOPATH/src/github.com/savoirfairelinux/opendht src/opendht/opendht
	ln -s $$PWD/src/opendht/opendht.i $$PWD/src/opendht/opendht.i

.PHONY: deps.matrix
deps.matrix:
	go get github.com/matrix-org/gomatrix

.PHONY: deps.golang
deps.golang:
	[ -e $$GOPATH/src ]

.PHONY: deps
deps: deps.golang deps.matrix

.PHONY: buildwatch
buildwatch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	clear; $(BUILD_ENV) $(TEST_CMD); \
	while true; do watchman-wait . -p "**/*"; clear; make build; sleep .3; done

.PHONY: testwatch
testwatch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	clear; $(BUILD_ENV) $(TEST_CMD); \
	while true; do watchman-wait . -p "**/*"; clear; $(BUILD_ENV) $(TEST_CMD); sleep .3; done

.PHONY: test
test:
	$(BUILD_ENV) $(TEST_CMD)
