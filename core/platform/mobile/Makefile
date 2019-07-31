export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

BUILD_MODE ?= dev

CORE_PACKAGE := $(PWD)/../..
CORE_MOBILE := $(PWD)/core
CORE_SOURCES := $(shell find $(CORE_PACKAGE) -type f -name "*.go") \
				$(shell find $(CORE_MOBILE) -type f -name "*.go")

BUILD_PATCH_PATH :=	$(PWD)/../../../build/docker/patch

ANDROID_PATH := $(PWD)/../../../client/android
BLE_JAR_PATH := $(ANDROID_PATH)/ble/build/libs/ble.jar
BLE_DIR_PATH := $(ANDROID_PATH)/ble/build/libs
BLE_BIND_PATH := /tmp/ble

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

LIBS_PATH := $(PWD)/../common/openssl/built

IOS_BUILD_PATH := $(PWD)/../../../client/ios
IOS_LDFLAGS := -L$(LIBS_PATH)/ios

ANDROID_NDK_HOME := /usr/local/share/android-ndk/
ANDROID_ARCHS := aarch64 arm x86_64 x86
ANDROID_LIBS_PATHS := $(addprefix $(LIBS_PATH)/android/, $(ANDROID_ARCHS))
ANDROID_LDFLAGS := $(addprefix -L, $(ANDROID_LIBS_PATHS))
ANDROID_BUILD_PATH := $(ANDROID_PATH)/core
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
deps: ios-deploy gomobile gobind

.PHONY: gomobile
gomobile: $(GOPATH)/src/golang.org/x/mobile/cmd/gomobile

.PHONY: gobind
gobind: $(GOPATH)/src/golang.org/x/mobile/cmd/gobind

$(GOPATH)/src/golang.org/x/mobile/cmd/%:
	cd $(GOPATH)/src/golang.org/x/mobile && git checkout -- . || true
	GO111MODULE=off go get -u $(patsubst $(GOPATH)/src/%,%,$@)
	patch -N $(GOPATH)/src/golang.org/x/mobile/cmd/gomobile/env.go $(BUILD_PATCH_PATH)/gomobile-env-flag.diff || (rm -rf $(GOPATH)/src/golang.org/x/mobile && false)

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
deps.android: deps unsed.ble
	cd ../../../client && make deps.lerna

.PHONY: build.core
build.core: deps.android $(ANDROID_BUILD_PATH)/core.aar

.PHONY: build.android
build.android: deps.android sed.ble build.ble unsed.ble build.core build.ble

.PHONY: sed.ble
sed.ble:
	$(SED_CMD) "s/.*implementation project\(':core'\)/\/\/implementation project\(':core'\)/g" $(ANDROID_PATH)/ble/build.gradle
	$(SED_CMD) 's/(.*Core.*)/\/\/\1/g' $(ANDROID_PATH)/ble/src/main/java/chat/berty/ble/*.java
	$(SED_CMD) 's/[\/\/]*([[:space:]]*if \(\!?Core.*)/if\(true\)\{\/\/\1/g' $(ANDROID_PATH)/ble/src/main/java/chat/berty/ble/*.java

.PHONY: unsed.ble
unsed.ble:
	$(SED_CMD) "s/.*\/\/implementation project\(':core'\)/implementation project\(':core'\)/g" $(ANDROID_PATH)/ble/build.gradle
	$(SED_CMD) 's/[\/\/]*(.*Core.*)/\1/g' $(ANDROID_PATH)/ble/src/main/java/chat/berty/ble/*.java
	$(SED_CMD) 's/[^[:space:]]*([[:space:]]*if \(\!?Core.*)/\1/g' $(ANDROID_PATH)/ble/src/main/java/chat/berty/ble/*.java

.PHONY: build.ble
build.ble: $(BLE_DIR_PATH)/ble.jar

$(BLE_DIR_PATH)/ble.jar:
	GO111MODULE=on go mod vendor
	cd $(ANDROID_PATH) && ./gradlew ble:createJar && cd -

$(ANDROID_BUILD_PATH)/core.aar: $(CORE_SOURCES)
	GO111MODULE=on go mod vendor
	mkdir -p $(ANDROID_BUILD_PATH)
	GO111MODULE=off GOOS=android GOPATH=$(GOPATH) CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(ANDROID_LDFLAGS)" \
		gomobile bind -v $(EXT_LDFLAGS) $(GOMOBILES_OPT) -classpath=$(ANDROID_PATH)/ble/libs/jars/ble.jar -o $(ANDROID_BUILD_PATH)/core.aar berty.tech/core/platform/mobile/core

.PHONY: deps.ios
deps.ios: deps

.PHONY: build.ios
build.ios: deps.ios $(IOS_BUILD_PATH)/core.framework/Core

$(IOS_BUILD_PATH)/core.framework/Core: $(CORE_SOURCES)
	GO111MODULE=on go mod vendor
	mkdir -p $(IOS_BUILD_PATH)
	GO111MODULE=off CGO_CPPFLAGS="$(CGO_CPPFLAGS)" CGO_LDFLAGS="$(IOS_LDFLAGS)" gomobile bind -v $(EXT_LDFLAGS) $(GOMOBILES_OPT) -target=ios -o $(IOS_BUILD_PATH)/core.framework berty.tech/core/platform/mobile/core

.PHONY: build
build: build.android build.ios

.PHONY: clean.core
clean.core:
	rm -rf $(ANDROID_BUILD_PATH)/core.aar

.PHONY: clean.ble
clean.ble:
	rm -rf $(ANDROID_PATH)/ble/libs/jars/ble.jar

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
