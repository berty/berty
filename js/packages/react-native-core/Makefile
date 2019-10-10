export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

deps.react-native-core.android:
	ANDROID_OUT_PATH=$(PWD)/android $(MAKE) -C $(abspath $(PWD)/../../../core/platform/mobile) build.android
