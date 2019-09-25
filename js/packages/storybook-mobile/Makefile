export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export SHELL := /bin/bash

.PHONY: deps.storybook.mobile
deps.storybook.mobile: export PWD := $(PWD)
deps.storybook.mobile: $(PWD)/node_modules
	cd $(PWD) && lsof -t -i :7007 || echo Y | start-storybook &
	cd $(PWD) && react-native start &

.PHONY: run.storybook.ios
run.storybook.ios: export PWD := $(PWD)
run.storybook.ios: deps.storybook.mobile $(PWD)/ios/Pods
	cd $(PWD) && react-native run-ios --no-packager

$(PWD)/ios/Pods: $(PWD)/ios/Podfile
	cd $(PWD)/ios && pod install

.PHONY: run.storybook.android
run.storybook.android: export PWD := $(PWD)
run.storybook.android: deps.storybook.mobile $(PWD)/android/app/debug.keystore
	cd $(PWD) \
		&& clisim -af \
		&& react-native run-android --no-packager

$(PWD)/android/app/debug.keystore: $(HOME)/.android/debug.keystore
	cp $< $@

$(HOME)/.android/debug.keystore:
	keytool -list -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android

.PHONY: run.storybook.mobile
run.storybook.mobile: run.storybook.ios run.storybook.android

.PHONY: \
	fclean.storybook.ios \
	fclean.storybook.android \
	fclean.storybook

fclean.storybook.ios: export PWD := $(PWD)
fclean.storybook.ios:
	cd $(PWD)/ios; \
		rm -rf build; \
		xcodebuild clean; \
		rm -rf $(HOME)/Library/Developer/Xcode/DerivedData; \
		rm -rf Pods; rm -rf ~/Library/Caches/CocoaPods

fclean.storybook.android: export PWD := $(PWD)
fclean.storybook.android:

fclean.storybook: fclean.ios fclean.android
