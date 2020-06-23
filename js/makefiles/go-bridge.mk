GOBRIDGE_PWD=$(shell pwd)/packages/go-bridge
GOPATH ?=$(HOME)/go

BAZEL_FRAMEWORK := $(GOBRIDGE_PWD)/bazel-bin/ios/gobridge_framework.tar.gz
FRAMEWORK_DIR := $(GOBRIDGE_PWD)/ios/Frameworks
FRAMEWORK := $(FRAMEWORK_DIR)/Bertybridge.framework
FRAMEWORK_TARGETS := $(addsuffix .ios, $(shell \
	find $(addprefix $(BERTY_ROOT)/,vendor go) -name '*.go' -newer "$(FRAMEWORK_DIR)" || echo "$(FRAMEWORK_DIR).go") \
)

BAZEL_AAR := $(GOBRIDGE_PWD)/bazel-bin/android/gobridge_library.aar
AAR_DIR := $(GOBRIDGE_PWD)/android/libs
AAR := $(GOBRIDGE_PWD)/android/libs/gobridge.aar
AAR_TARGETS := $(addsuffix .android, $(shell \
	find $(addprefix $(BERTY_ROOT)/,vendor go) -name '*.go' -newer "$(AAR_DIR)" || echo "$(AAR_DIR).go") \
)

GO_VENDOR := $(BERTY_ROOT)/vendor
GOMOBILE := $(GOPATH)/bin/gomobile
GOBIND := $(GOPATH)/bin/gobind

VERSION ?= `git describe --tags --always`
VCS_REF ?= `git rev-parse --short HEAD`
BUILD_DATE ?= `date +%s`
EXT_LDFLAGS = -ldflags="-X berty.tech/berty/go/pkg/bertymessenger.VcsRef=$(VCS_REF) -X berty.tech/berty/go/pkg/bertymessenger.Version=$(VERSION) -X berty.tech/berty/go/pkg/bertymessenger.BuildTime=$(BUILD_DATE)"

deps.gobridge: $(GOMOBILE) $(GO_VENDOR)
	cd $(GOBRIDGE_PWD) && $(GOMOBILE) init

$(GO_VENDOR):
	cd $(GOPATH)/src/berty.tech/berty && GO111MODULE=on go mod vendor

$(GOMOBILE): $(GOBRIDGE_PWD) := $(GOBRIDGE_PWD)
$(GOMOBILE): $(GOBIND)
	GO111MODULE=off go get golang.org/x/mobile/cmd/gomobile

$(GOBIND):
	GO111MODULE=off go get golang.org/x/mobile/cmd/gobind

build.gobridge: build.gobridge.ios build.gobridge.android

$(FRAMEWORK_TARGETS):%.go.ios: deps.gobridge build.framework # TODO: add go prerequisits
build.gobridge.ios: $(FRAMEWORK_TARGETS)

$(AAR_TARGETS):%.go.android: deps.gobridge build.aar # TODO: add go prerequisits
build.gobridge.android: $(AAR_TARGETS)

build.framework:
	@mkdir -p "$(FRAMEWORK_DIR)"
	GO111MODULE=off gomobile bind -o $(FRAMEWORK) -v $(EXT_LDFLAGS) -target ios berty.tech/berty/go/framework/bertybridge
	touch "$(FRAMEWORK_DIR)"

build.aar:
	@mkdir -p "$(AAR_DIR)"
	GO111MODULE=off gomobile bind -o $(AAR) -v $(EXT_LDFLAGS) -target android berty.tech/berty/go/framework/bertybridge
	touch "$(AAR_DIR)"


bazel.build.gobridge: bazel.build.gobridge.ios bazel.build.gobridge.android

bazel.build.gobridge.ios: $(BAZEL_FRAMEWORK)
	touch $<

.PHONY: $(BAZEL_FRAMEWORK)
$(BAZEL_FRAMEWORK):
	bazel build //ios:gobridge_framework
	mkdir -p $(FRAMEWORK) && tar -xvf $(BAZEL_FRAMEWORK) -C $(FRAMEWORK)

bazel.build.gobridge.android: $(BAZEL_AAR)
	touch $<

.PHONY: $(BAZEL_AAR)
$(BAZEL_AAR):
	bazel build //android:gobridge_library.aar --sandbox_debug
	mkdir -p $(AAR_DIR) && cp -v $(BAZEL_AAR) $(AAR) && chmod =rw,+X $(AAR)

bazel.watch.gobridge.android:
	ibazel build //android:gobridge_library.aar

clean.gobridge: clean.gobridge.ios clean.gobridge.android

clean.gobridge.ios:
	rm -rf $(FRAMEWORK)

clean.gobridge.android:
	rm -f $(AAR)
