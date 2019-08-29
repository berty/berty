export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

BUILD_MODE ?= dev

CORE_PACKAGE := $(PWD)/../..
CORE_MOBILE := $(PWD)/core
CORE_SOURCES := $(shell find $(CORE_PACKAGE) -type f -name "*.go" -not -path "$(CORE_PACKAGE)/platform/*") \
				$(shell find $(CORE_MOBILE) -type f -name "*.go")

BUILD_PATCH_PATH :=	$(PWD)/../../../build/docker/patch

GIT_SHA ?= $(shell git rev-parse HEAD)
GIT_TAG ?= $(shell git describe --tags --always)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT_DATE ?= $(shell git show -s --format=%ct $(GIT_SHA))
EXT_LDFLAGS ?= -ldflags="-X \"berty.tech/core.GitTag=$(GIT_TAG)\" -X \"berty.tech/core.GitBranch=$(GIT_BRANCH)\" -X \"berty.tech/core.GitSha=$(GIT_SHA)\" -X \"berty.tech/core.BuildMode=$(BUILD_MODE)\" -X \"berty.tech/core.commitDate=$(GIT_COMMIT_DATE)\""

GOPATH ?=		$(HOME)/go

CGO_CPPFLAGS ?= -Wno-nullability-completeness \
				-Wno-error=unused-command-line-argument \
				-I$(PWD)/../common/openssl/built/include

CGO_OS_LDFLAGS ?= -L/usr/local/opt/openssl/lib
CGO_OS_CPPFLAGS ?= -I/usr/local/opt/openssl/include

SSL_LIBS_PATH := $(PWD)/../common/openssl/built

IOS_BUILD_PATH := $(PWD)/../../../client/ios
IOS_LDFLAGS := -L$(SSL_LIBS_PATH)/ios

ANDROID_PATH := $(PWD)/../../../client/android
ANDROID_NDK_HOME := /usr/local/share/android-ndk/
ANDROID_ARCHS := aarch64 arm x86_64 x86
ANDROID_SSL_LIBS_PATHS := $(addprefix $(SSL_LIBS_PATH)/android/, $(ANDROID_ARCHS))
ANDROID_LDFLAGS := $(addprefix -L, $(ANDROID_SSL_LIBS_PATHS))
ANDROID_LATEST_SDK_VER := $(shell ls $$ANDROID_HOME/platforms | awk '{ print length, $$0 }' | sort -n -s | cut -d" " -f2- | tail -n1)
ANDROID_LATEST_SDK_LIB := $(ANDROID_HOME)/platforms/$(ANDROID_LATEST_SDK_VER)/android.jar

ANDROID_LIBS_PATH := $(ANDROID_PATH)/app/libs
ANDROID_BLE_DRIVER_PATH := $(PWD)/../../../network/transport/ble/driver/android_native
ANDROID_BLE_DRIVER_DIRS := $(shell find $(ANDROID_BLE_DRIVER_PATH) -type d)
ANDROID_BLE_DRIVER_FILES := $(shell find $(ANDROID_BLE_DRIVER_PATH) -type f -name '*')
ANDROID_CORE_AAR := $(ANDROID_LIBS_PATH)/core.aar
ANDROID_BLE_JAR := $(ANDROID_LIBS_PATH)/ble-sources.jar
ANDROID_BLE_AAR := $(ANDROID_LIBS_PATH)/ble.aar
ANDROID_BLE_LIBS := $(ANDROID_BLE_AAR) $(ANDROID_BLE_JAR)

GOMOBILES_OPT ?=

GOTEST_TIMEOUT ?= 30s

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
	SED_CMD += sed -E -i ''
else
	SED_CMD += sed -r -i
endif

.PHONY: help
help:
	@echo "Gomobile commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

.PHONY: deps-osx
deps-osx:
	brew cask install android-sdk android-ndk

.PHONY: deps
deps: ios-deploy gomobile gobind
	cd $(PWD)/../.. && make deps
	[ ! -z "$$CIRCLE_JOB" ] || (cd $(PWD)/../.. && make generate)

.PHONY: gomobile
gomobile: $(GOPATH)/src/golang.org/x/mobile/cmd/gomobile

.PHONY: gobind
gobind: $(GOPATH)/src/golang.org/x/mobile/cmd/gobind

$(GOPATH)/src/golang.org/x/mobile/cmd/gomobile $(GOPATH)/src/golang.org/x/mobile/cmd/gobind:
	cd $(GOPATH)/src/golang.org/x/mobile && git checkout -- . || true
	GO111MODULE=off go get -u $(GOPATH)/src/golang.org/x/mobile/cmd/gomobile
	GO111MODULE=off go get -u $(GOPATH)/src/golang.org/x/mobile/cmd/gobind
	patch -N $(GOPATH)/src/golang.org/x/mobile/cmd/gomobile/env.go $(BUILD_PATCH_PATH)/gomobile-env-flag.diff || (rm -rf $(GOPATH)/src/golang.org/x/mobile && false)
	cd $(GOPATH)/src/golang.org/x/mobile && GO111MODULE=off go install -v ./cmd/...
	gomobile init -v

ifeq ($(UNAME_S),Darwin)
IOS_DEPLOY = $(shell which ios-deploy || echo '/usr/local/bin/ios-deploy')
endif
.PHONY: ios-deploy
ios-deploy: $(IOS_DEPLOY)

$(IOS_DEPLOY):
	npm install -g ios-deploy

.PHONY: test
test:
	cd $(CORE_MOBILE) && CGO_LDFLAGS="$(CGO_OS_LDFLAGS)" CGO_CPPFLAGS="$(CGO_OS_CPPFLAGS)" go test -test.timeout $(GOTEST_TIMEOUT) -v ./...

.PHONY: deps.android
deps.android: deps
	cd ../../../client && make deps.lerna

.PHONY: build.android
build.android: deps.android $(ANDROID_CORE_AAR)

$(ANDROID_CORE_AAR): $(ANDROID_BLE_LIBS) $(CORE_SOURCES) | deps.android
	mkdir -p $(ANDROID_LIBS_PATH)
	GO111MODULE=off GOOS=android GOPATH=$(GOPATH) CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(ANDROID_LDFLAGS)" \
		gomobile bind -v $(EXT_LDFLAGS) $(GOMOBILES_OPT) -classpath='$(ANDROID_BLE_JAR):$(ANDROID_LATEST_SDK_LIB)' -o $(ANDROID_CORE_AAR) berty.tech/core/platform/mobile/core

$(ANDROID_BLE_LIBS): $(ANDROID_BLE_DRIVER_PATH) $(ANDROID_BLE_DRIVER_DIRS) $(ANDROID_BLE_DRIVER_FILES)
	cd $(ANDROID_BLE_DRIVER_PATH) && ./gradlew ble:build
	cp $(ANDROID_BLE_DRIVER_PATH)/ble/build/intermediates/packaged-classes/release/classes.jar $(ANDROID_BLE_JAR)
	cp $(ANDROID_BLE_DRIVER_PATH)/ble/build/outputs/aar/ble-release.aar $(ANDROID_BLE_AAR)

.PHONY: deps.ios
deps.ios: deps

.PHONY: build.ios
build.ios: deps.ios $(IOS_BUILD_PATH)/core.framework

$(IOS_BUILD_PATH)/core.framework: $(CORE_SOURCES) | deps
	mkdir -p $(IOS_BUILD_PATH)
	GO111MODULE=off CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(IOS_LDFLAGS)" gomobile bind -v $(EXT_LDFLAGS) $(GOMOBILES_OPT) -target=ios -o $(IOS_BUILD_PATH)/core.framework berty.tech/core/platform/mobile/core

.PHONY: build
build: build.android build.ios

.PHONY: clean.core
clean.core:
	rm -rf $(ANDROID_CORE_AAR)

.PHONY: clean.ble
clean.ble:
	rm -rf $(ANDROID_BLE_LIBS)

.PHONY: clean.android
clean.android: clean.core clean.ble

.PHONY: clean.ios
clean.ios:
	rm -rf $(IOS_BUILD_PATH)/core.framework

.PHONY: clean
clean: clean.android clean.ios

.PHONY: re.android
re.android: build.ble clean.core build.core

.PHONY: re.ios
re.ios: clean.ios build.ios

.PHONY: re
re: clean build
