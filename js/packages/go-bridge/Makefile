export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

BAZEL_FRAMEWORK := $(PWD)/bazel-bin/ios/gobridge_framework.tar.gz
FRAMEWORK_DIR := $(PWD)/ios/Frameworks
FRAMEWORK := $(FRAMEWORK_DIR)/bertybridge.framework

BAZEL_AAR := $(PWD)/bazel-bin/android/gobridge_library.aar
AAR_DIR := $(PWD)/android/libs
AAR := $(PWD)/android/libs/gobridge.aar


build.gobridge: build.gobridge.ios build.gobridge.android

build.gobridge.ios: $(FRAMEWORK_DIR)
	touch $<

$(FRAMEWORK_DIR): # TODO: add go prerequisits
	mkdir -p $(FRAMEWORK_DIR)
	gomobile bind -o $(FRAMEWORK) -v -target ios berty.tech/berty/go/framework/bertybridge

build.gobridge.android: $(AAR)
	touch $<

$(AAR): # TODO: add go prerequisits
	mkdir -p $(AAR_DIR)
	gomobile bind -o $(AAR) -v -target android berty.tech/berty/go/framework/bertybridge

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
