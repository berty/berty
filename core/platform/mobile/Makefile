export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

BUILD_MODE ?= dev

CLIENT_PATH=$(abspath $(PWD)/../../../client)
ANDROID_OUT_PATH ?= $(CLIENT_PATH)/packages/react-native-core/android
ANDROID_CORE_SOURCES_PATH ?= $(CLIENT_PATH)/android
ANDROID_SOURCE_CORE = $(ANDROID_CORE_SOURCES_PATH)/core/core.aar
ANDROID_CORE = $(ANDROID_OUT_PATH)/core.aar

CORE_PACKAGE := $(abspath $(PWD)/../..)
CORE_MOBILE := $(PWD)/core
CORE_SOURCES := $(shell find $(CORE_PACKAGE) -type f -name "*.go" -not -path "$(CORE_PACKAGE)/platform/*") \
				$(shell find $(CORE_MOBILE) -type f -name "*.go")

BUILD_PATCH_PATH :=	$(abspath $(PWD)/../../../build/docker/patch)

BLE_ROOT = $(ANDROID_CORE_SOURCES_PATH)/ble
BLE_JAR = $(BLE_ROOT)/build/libs/ble.jar
BLE_MANAGER_SOURCE = $(BLE_ROOT)/src/main/java/libp2p/transport/ble/BleManager.java
BLE_BUILD_SOURCE = $(BLE_ROOT)/build.gradle

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

LIBS_PATH := $(abspath $(PWD)/../common/openssl/built)

IOS_BUILD_PATH := $(abspath $(PWD)/../../../client/packages/react-native-core/ios)
IOS_LDFLAGS := -L$(LIBS_PATH)/ios

ANDROID_NDK_HOME := /usr/local/share/android-ndk/
ANDROID_ARCHS := aarch64 arm x86_64 x86
ANDROID_LIBS_PATHS := $(addprefix $(LIBS_PATH)/android/, $(ANDROID_ARCHS))
ANDROID_LDFLAGS := $(addprefix -L, $(ANDROID_LIBS_PATHS))

GOMOBILES_OPT ?=

GOTEST_TIMEOUT ?= 30s

TEST_FILE_CMD = stat -t 2>/dev/null

SED_CMD :=
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
	[ ! -z "$$CIRCLE_JOB" ] || (cd $(abspath $(PWD)/../..) && make generate)

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
	$(MAKE) -C $(CLIENT_PATH) $(abspath $(CLIENT_PATH)/node_modules)

.PHONY: build.core
build.core: deps.android $(ANDROID_SOURCE_CORE)

.PHONY: build.android
build.android: deps.android
	$(MAKE) build.ble
	$(MAKE) build.core
	$(MAKE) build.ble
	rm -f $(ANDROID_CORE)
	ln -s $(ANDROID_SOURCE_CORE) $(ANDROID_CORE)

.PHONY: build.ble
build.ble: $(BLE_JAR)

$(BLE_JAR): deps.android
	$(SED_CMD) "s/.*implementation project\(':core'\)/\/\/implementation project\(':core'\)/g" $(BLE_BUILD_SOURCE)
	$(SED_CMD) 's/new GoBridgeImplem\(\)/null/g' $(BLE_MANAGER_SOURCE)
	$(SED_CMD) 's/(.*GoBridgeImplem.*)/\/\/\1/g' $(BLE_MANAGER_SOURCE)
	cd $(ANDROID_CORE_SOURCES_PATH) && ./gradlew ble:createJar

$(ANDROID_SOURCE_CORE): $(CORE_SOURCES) | deps.android
	$(SED_CMD) "s/.*\/\/implementation project\(':core'\)/implementation project\(':core'\)/g" $(BLE_BUILD_SOURCE)
	$(SED_CMD) 's/(goBridge = )(null)/\1new GoBridgeImplem\(\)/g' $(BLE_MANAGER_SOURCE)
	$(SED_CMD) 's/[\/\/]*(.*GoBridgeImplem.*)/\1/g' $(BLE_MANAGER_SOURCE)
	mkdir -p $(ANDROID_OUT_PATH)
	- mv $(PWD)/core/os_android.go_ $(PWD)/core/os_android.go
	- GO111MODULE=off GOOS=android GOPATH=$(GOPATH) CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(ANDROID_LDFLAGS)" \
		gomobile bind -v $(EXT_LDFLAGS) $(GOMOBILES_OPT) -classpath=$(BLE_ROOT)/libs/jars/ble.jar -o $@ berty.tech/core/platform/mobile/core
	mv $(PWD)/core/os_android.go $(PWD)/core/os_android.go_

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
	rm -rf $(ANDROID_CORE)

.PHONY: clean.ble
clean.ble:
	rm -rf $(BLE_JAR)

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
