MAKEFILE_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

CORE_PACKAGE := $(MAKEFILE_DIR)/../../../core
CORE_SOURCES := $(shell find $(CORE_PACKAGE) -type f -name "*.go") \
				$(shell find . -type f -name "*.go")

BUILD_PATCH_PATH :=	$(MAKEFILE_DIR)/../../../.circleci/docker

GOPATH ?=		$(HOME)/go

CGO_CPPFLAGS ?= -I$(MAKEFILE_DIR)/../../common/openssl/built/include

LIBS_PATH := $(MAKEFILE_DIR)/../../common/openssl/built

IOS_BUILD_PATH := $(MAKEFILE_DIR)/../ios
IOS_LDFLAGS := -L$(LIBS_PATH)/ios

ANDROID_NDK_HOME := /usr/local/share/android-ndk/
ANDROID_ARCHS := aarch64 arm x86_64 x86
ANDROID_LIBS_PATHS := $(addprefix $(LIBS_PATH)/android/, $(ANDROID_ARCHS))
ANDROID_LDFLAGS := $(addprefix -L, $(ANDROID_LIBS_PATHS))
ANDROID_BUILD_PATH := $(MAKEFILE_DIR)/../android/app/libs
ANDROID_BUILD := $(addprefix $(ANDROID_BUILD_PATH)/core., $(addsuffix .aar, $(ANDROID_ARCHS)))

GOTEST_TIMEOUT ?= 30s

.PHONY: help
help:
	@echo "Gomobile commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

.PHONY: deps-osx
deps-osx:
	brew cask install android-sdk android-ndk

.PHONY: deps
deps:
	GO111MODULE=off go get golang.org/x/mobile/cmd/gomobile
	patch -N ~/go/src/golang.org/x/mobile/cmd/gomobile/env.go $(BUILD_PATCH_PATH)/gomobile-env-flag.diff || true
	go install golang.org/x/mobile/cmd/gomobile
	go get -v golang.org/x/mobile/cmd/gobind
	gomobile init

.PHONY: init
init: deps
	gomobile init -v -ndk $(ANDROID_NDK_HOME)

.PHONY: test
test:
	go test -test.timeout $(GOTEST_TIMEOUT) -v ./...

.PHONY: build.android
build.android: $(ANDROID_BUILD_PATH)/core.aar

$(ANDROID_BUILD_PATH)/core.aar: $(CORE_SOURCES)
	GO111MODULE=on go mod vendor
	mkdir -p $(ANDROID_BUILD_PATH)
	CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(ANDROID_LDFLAGS)" \
		gomobile bind -v -target=android -o $(ANDROID_BUILD_PATH)/core.aar .

.PHONY: build.ios
build.ios: $(IOS_BUILD_PATH)/core.framework/Core

$(IOS_BUILD_PATH)/core.framework/Core: $(CORE_SOURCES)
	GO111MODULE=on go mod vendor
	mkdir -p $(IOS_BUILD_PATH)
	CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(IOS_LDFLAGS)" \
		gomobile bind -v -target=ios -o $(IOS_BUILD_PATH)/core.framework .

.PHONY: build
build: build.android build.ios

.PHONY: clean.android
clean.android:
	rm -rf $(ANDROID_BUILD_PATH)/core.aar

.PHONY: clean.ios
clean.ios:
	rm -rf $(IOS_BUILD_PATH)/core.framework

.PHONY: clean
clean: clean.android clean.ios

.PHONY: re.android
re.android: clean.android build.android

.PHONY: re.ios
re.ios: clean.ios build.ios

.PHONY: re
re: clean build
