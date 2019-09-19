export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export SHELL := /bin/bash

.PHONY: deps.storybook.mobile
deps.storybook.mobile: export PWD := $(PWD)
deps.storybook.mobile: $(PWD)/node_modules
	cd $(PWD) \
		&& (kill $$(lsof -t -i :7007) 2>/dev/null || true) \
		&& echo Y | start-storybook &

.PHONY: run.storybook.ios
run.storybook.ios: export PWD := $(PWD)
run.storybook.ios: deps.storybook.mobile $(PWD)/ios/Pods
	cd $(PWD) \
		&& react-native run-ios

$(PWD)/ios/Pods: $(PWD)/ios/Podfile
	cd $(PWD)/ios && pod install

.PHONY: run.storybook.android
run.storybook.android: export PWD := $(PWD)
run.storybook.android: deps.storybook.mobile $(PWD)/android/app/debug.keystore
	cd $(PWD) \
		&& clisim -af \
		&& (kill $$(lsof -t -i :8081) 2>/dev/null || true) \
		&& react-native run-android

$(PWD)/android/app/debug.keystore: $(HOME)/.android/debug.keystore
	cp $< $@

$(HOME)/.android/debug.keystore:
	keytool -list -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android

.PHONY: run.storybook.mobile
run.storybook.mobile: run.storybook.ios run.storybook.android
