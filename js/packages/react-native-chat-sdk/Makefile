export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

BAZEL_FRAMEWORK := $(PWD)/bazel-bin/ios/bridge_framework.tar.gz
FRAMEWORK := $(PWD)/ios/Frameworks/Bridgechat.framework

BAZEL_AAR := $(PWD)/bazel-bin/android/bridge_library.aar
AAR_DIR := $(PWD)/android/libs
AAR := $(PWD)/android/libs/Bridgechat.aar


build.sdk: build.sdk.ios build.sdk.android

build.sdk.ios:
	GO111MODULE=off gomobile bind -o $(FRAMEWORK) -v -target ios  berty.tech/go/framework/chatbridge

build.sdk.android:
	GO111MODULE=off gomobile bind -o $(AAR) -v -target android  berty.tech/go/framework/chatbridge

bazel.build.sdk: bazel.build.sdk.ios bazel.build.sdk.android

bazel.build.sdk.ios:
	bazel build //ios:bridge_framework
	mkdir -p $(FRAMEWORK) && tar -xvf $(BAZEL_FRAMEWORK) -C $(FRAMEWORK)

bazel.build.sdk.android:
	bazel build //android:bridge_library.aar --sandbox_debug
	mkdir -p $(AAR_DIR) && cp -v $(BAZEL_AAR) $(AAR) && chmod =rw,+X $(AAR)

bazel.watch.sdk.android:
	ibazel build //android:bridge_library.aar

clean.sdk: clean.sdk.ios clean.sdk.android

clean.sdk.ios:
	rm -rf $(FRAMEWORK)

clean.sdk.android:
	rm -f $(AAR)
