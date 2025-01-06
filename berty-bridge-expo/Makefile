check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))
rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
GO ?= go # this allows to override the go version used
GO_TAGS ?= -tags "fts5 sqlite sqlite_unlock_notify"
GOMOBILE_IOS_TARGET ?= ios
GOMOBILE_ANDROID_TARGET ?= android

make_dir := $(realpath $(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
bridge_src := $(call rwildcard,../go,*.go *.m *.h) ../go.sum
gomobile_cache="$(make_dir)/.gomobile-cache"
IOS_OUTPUT_BERTYPUSH_FRAMEWORK ?= $(make_dir)/plugin/src/NotificationService/Bertypush.xcframework
IOS_OUTPUT_BERTYBRIDGE_FRAMEWORK ?= $(make_dir)/ios/Frameworks/Bertybridge.xcframework
ANDROID_OUTPUT_LIBS ?= $(make_dir)/android/libs/gobridge.aar
ext_ldflags = -ldflags="-X berty.tech/berty/v2/go/pkg/bertyversion.VcsRef=$(VCS_REF) -X berty.tech/berty/v2/go/pkg/bertyversion.Version=$(VERSION)"
minimum_ios_ver = 12.0
minimum_android_ver = 21

node_modules: package.json
	$(call check-program, npm)
	npm install $(if $(filter $(CI), true), --frozen-lockfile --network-timeout 1200000 --network-concurrency 1)
	touch $@

#### iOS

.PHONY: ios.gomobile
ios.gomobile: node_modules $(IOS_OUTPUT_BERTYBRIDGE_FRAMEWORK) $(IOS_OUTPUT_BERTYPUSH_FRAMEWORK)

$(IOS_OUTPUT_BERTYBRIDGE_FRAMEWORK): $(bridge_src)
	cd .. && $(GO) mod download
	cd .. && $(GO) install golang.org/x/mobile/cmd/gobind
	cd .. && $(GO) run golang.org/x/mobile/cmd/gomobile init
	mkdir -p $(gomobile_cache) ios/Frameworks

# use `nowatchdog` tags, see https://github.com/libp2p/go-libp2p-connmgr/issues/98
	cd .. && \
		PATH="$(PATH):`go env GOPATH`/bin" \
		CGO_CPPFLAGS=-DHAVE_GETHOSTUUID=0 \
		$(GO) run golang.org/x/mobile/cmd/gomobile bind \
			-v $(ext_ldflags) \
			-o $@ \
			$(GO_TAGS) -tags 'nowatchdog' \
			-cache $(gomobile_cache)/bertybridge \
			-target $(GOMOBILE_IOS_TARGET) \
			-iosversion $(minimum_ios_ver) \
			./go/framework/bertybridge

	touch $@
	cd .. && $(GO) mod tidy

$(IOS_OUTPUT_BERTYPUSH_FRAMEWORK): $(bridge_src)
	cd .. && $(GO) mod download
	cd .. && $(GO) install golang.org/x/mobile/cmd/gobind
	cd .. && $(GO) run golang.org/x/mobile/cmd/gomobile init
	mkdir -p $(gomobile_cache) plugin/src/NotificationService

# use `nowatchdog` tags, see https://github.com/libp2p/go-libp2p-connmgr/issues/98
	cd .. && \
		PATH="$(PATH):`go env GOPATH`/bin" \
		CGO_CPPFLAGS=-DHAVE_GETHOSTUUID=0 \
		$(GO) run golang.org/x/mobile/cmd/gomobile bind \
			-o $@ \
			-v $(ext_ldflags) \
			$(GO_TAGS) -tags 'nowatchdog,noproximitytransport' \
			-cache $(gomobile_cache)/bertypush \
			-target $(GOMOBILE_IOS_TARGET) \
			-iosversion $(minimum_ios_ver) \
			./go/framework/bertypush

	touch $@
	cd .. && $(GO) mod tidy

#### Android

.PHONY: android.gomobile
android.gomobile: node_modules $(ANDROID_OUTPUT_LIBS)

$(ANDROID_OUTPUT_LIBS): $(bridge_src)
	cd .. && $(GO) mod download
	cd .. && $(GO) run golang.org/x/mobile/cmd/gomobile init
	mkdir -p $(gomobile_cache) android/libs
	cd .. && GO111MODULE=on $(GO) run golang.org/x/mobile/cmd/gomobile bind \
		-o $@ \
		-v $(ext_ldflags) \
		$(GO_TAGS) \
		-cache $(gomobile_cache)/android_bertybridge \
		-target $(GOMOBILE_ANDROID_TARGET) \
		-androidapi $(minimum_android_ver) \
		./go/framework/bertybridge
	touch $@
	cd .. && $(GO) mod tidy

.PHONY: clean
clean:
	rm -fr node_modules

	rm -fr $(gomobile_cache)
	rm -fr ios/Frameworks
	rm -fr android/libs

	rm -fr example/android
	rm -fr example/ios
	rm -fr example/node_modules

.PHONY: help
help:
	@echo "Available make commands:"
	@cat Makefile | grep '^[a-z]' | grep -v '=' | cut -d: -f1 | sort | sed 's/^/  /'
