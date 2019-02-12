OPENDHT_PATH ?= $$PWD/src/opendht
MATRIX_PATH ?= $$PWD/src/matrix

CGO_LDFLAGS ?= -L/usr/local/lib -lopendht -lgnutls
CGO_CPPFLAGS ?=  -I$$GOPATH/src/github.com/savoirfairelinux/opendht/include/opendht \
 -I$$GOPATH/src/github.com/savoirfairelinux/opendht/argon2/include
SWIG_FLAGS ?= -I$$GOPATH/src/github.com/savoirfairelinux/opendht/include \

BUILD_ENV ?= GO111MODULE=on CGO_LDFLAGS="$(CGO_LDFLAGS)" CGO_CPPFLAGS="$(CGO_CPPFLAGS)"
TEST_PATHS ?= ./...
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
	xcode-select --install
	sudo easy_install pip
	sudo pip install virtualenv
	brew install pkg-config libffi

.PHONY: deps.golang
deps.golang:
	[ -e $$GOPATH/src ]

.PHONY: deps
deps: deps.golang deps.opendht

.PHONY: build.opendht
build.opendht:
	swig $(SWIG_FLAGS) -cpperraswarn -go -cgo -c++ -intgosize 64 src/opendht/opendht/opendht.i

.PHONY: build
build: build.opendht

.PHONY: buildwatch
buildwatch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	clear; $(BUILD_ENV) $(TEST_CMD); \
	while true; do watchman-wait . -p "**/*"; clear; make build; sleep .3; done

.PHONY: testwatch
testwatch: build
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT; \
	clear; $(BUILD_ENV) $(TEST_CMD); \
	while true; do watchman-wait . -p "**/*"; clear; $(BUILD_ENV) $(TEST_CMD); sleep .3; done

.PHONY: test
test:
	$(BUILD_ENV) $(TEST_CMD)
