BUILD_MODE ?= dev

MAKEFILE_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

CORE_PACKAGE := $(MAKEFILE_DIR)/../../../core
CORE_MOBILE := $(MAKEFILE_DIR)/core
CORE_SOURCES := $(shell find $(CORE_PACKAGE) -type f -name "*.go") \
				$(shell find $(CORE_MOBILE) -type f -name "*.go")

BUILD_PATCH_PATH :=	$(MAKEFILE_DIR)/../../../build/docker/patch

ANDROID_PATH := $(MAKEFILE_DIR)/../android
BLE_JAR_PATH := $(MAKEFILE_DIR)/../android/ble/build/libs/ble.jar
BLE_DIR_PATH := $(MAKEFILE_DIR)/../android/ble/build/libs
BLE_BIND_PATH := /tmp/ble

GIT_SHA ?= $(shell git rev-parse HEAD)
GIT_TAG ?= $(shell git describe --tags --always)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT_DATE ?= $(shell git show -s --format=%ct $(GIT_SHA))
EXT_LDFLAGS ?= -ldflags="-X \"berty.tech/client/react-native/gomobile/vendor/berty.tech/core.GitTag=$(GIT_TAG)\" -X \"berty.tech/client/react-native/gomobile/vendor/berty.tech/core.GitBranch=$(GIT_BRANCH)\" -X \"berty.tech/client/react-native/gomobile/vendor/berty.tech/core.GitSha=$(GIT_SHA)\" -X \"berty.tech/client/react-native/gomobile/vendor/berty.tech/core.BuildMode=$(BUILD_MODE)\" -X \"berty.tech/client/react-native/gomobile/vendor/berty.tech/core.commitDate=$(GIT_COMMIT_DATE)\""

GOPATH ?=		$(HOME)/go

CGO_CPPFLAGS ?= -Wno-error=unused-command-line-argument -I$(MAKEFILE_DIR)/../../common/openssl/built/include

CGO_OS_LDFLAGS ?= -L/usr/local/opt/openssl/lib
CGO_OS_CPPFLAGS ?= -I/usr/local/opt/openssl/include



LIBS_PATH := $(MAKEFILE_DIR)/../../common/openssl/built

IOS_BUILD_PATH := $(MAKEFILE_DIR)/../ios
IOS_LDFLAGS := -L$(LIBS_PATH)/ios

ANDROID_NDK_HOME := /usr/local/share/android-ndk/
ANDROID_ARCHS := aarch64 arm x86_64 x86
ANDROID_LIBS_PATHS := $(addprefix $(LIBS_PATH)/android/, $(ANDROID_ARCHS))
ANDROID_LDFLAGS := $(addprefix -L, $(ANDROID_LIBS_PATHS))
ANDROID_BUILD_PATH := $(MAKEFILE_DIR)/../android/core
ANDROID_BUILD := $(addprefix $(ANDROID_BUILD_PATH)/core., $(addsuffix .aar, $(ANDROID_ARCHS)))

GOMOBILES_OPT ?=

GOTEST_TIMEOUT ?= 30s

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
deps:
	rm -rf $(GOPATH)/src/golang.org/x/mobile
	GO111MODULE=off go get -u golang.org/x/mobile/cmd/gomobile
	GO111MODULE=off go get -u golang.org/x/mobile/cmd/gobind
	patch -N $(GOPATH)/src/golang.org/x/mobile/cmd/gomobile/env.go $(BUILD_PATCH_PATH)/gomobile-env-flag.diff
	GO111MODULE=off go install golang.org/x/mobile/cmd/gomobile

.PHONY: init
init: deps
	GO111MODULE=off gomobile init -v -ndk $(ANDROID_NDK_HOME)

.PHONY: test
test:
	cd $(CORE_MOBILE) && CGO_LDFLAGS="$(CGO_OS_LDFLAGS)" CGO_CPPFLAGS="$(CGO_OS_CPPFLAGS)" go test -test.timeout $(GOTEST_TIMEOUT) -v ./...

.PHONY: build.core
build.core: $(ANDROID_BUILD_PATH)/core.aar

.PHONY: build.android
build.android: sed.ble build.ble unsed.ble build.core build.ble

.PHONY: sed.ble
sed.ble:
	$(SED_CMD) "s/.*implementation project\(':core'\)/\/\/implementation project\(':core'\)/g" $(ANDROID_PATH)/ble/build.gradle
	$(SED_CMD) 's/(.*Core.*)/\/\/\1/g' $(ANDROID_PATH)/ble/src/main/java/chat/berty/ble/*.java

.PHONY: unsed.ble
unsed.ble:
	$(SED_CMD) "s/.*\/\/implementation project\(':core'\)/implementation project\(':core'\)/g" $(ANDROID_PATH)/ble/build.gradle
	$(SED_CMD) 's/[\/\/]*(.*Core.*)/\1/g' $(ANDROID_PATH)/ble/src/main/java/chat/berty/ble/*.java

.PHONY: build.ble
build.ble: $(BLE_DIR_PATH)/ble.jar

$(BLE_DIR_PATH)/ble.jar:
	GO111MODULE=on go mod vendor
	cd $(ANDROID_PATH) && ./gradlew ble:createJar && cd -

$(ANDROID_BUILD_PATH)/core.aar: $(CORE_SOURCES)
	GO111MODULE=on go mod vendor
	# GOOS=android gobind -lang=go,java -outdir=$(BLE_BIND_PATH) -classpath=$(MAKEFILE_DIR)/../android/ble/libs/jars/ble.jar berty.tech/core/network/ble
	mkdir -p $(ANDROID_BUILD_PATH)
	GO111MODULE=off GOOS=android GOPATH=$(GOPATH) CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(ANDROID_LDFLAGS)" \
		gomobile bind -v $(EXT_LDFLAGS) $(GOMOBILES_OPT) -classpath=$(MAKEFILE_DIR)/../android/ble/libs/jars/ble.jar -target=android/arm -o $(ANDROID_BUILD_PATH)/core.aar berty.tech/client/react-native/gomobile/core

.PHONY: build.ios
build.ios: $(IOS_BUILD_PATH)/core.framework/Core

$(IOS_BUILD_PATH)/core.framework/Core: $(CORE_SOURCES)
	GO111MODULE=on go mod vendor
	mkdir -p $(IOS_BUILD_PATH)
	GO111MODULE=off CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(IOS_LDFLAGS)" gomobile bind -v $(EXT_LDFLAGS) $(GOMOBILES_OPT) -target=ios -o $(IOS_BUILD_PATH)/core.framework berty.tech/client/react-native/gomobile/core

.PHONY: build
build: build.android build.ios

.PHONY: clean.core
clean.core:
	rm -rf $(ANDROID_BUILD_PATH)/core.aar

.PHONY: clean.ble
clean.ble:
	rm -rf $(MAKEFILE_DIR)/../android/ble/libs/jars/ble.jar

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
