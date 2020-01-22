export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

.PHONY: \
	start.storybook \
	start.storybook.mobile\

start.storybook.mobile: export PWD := $(PWD)
start.storybook.mobile: $(PWD)/node_modules $(PWD)/storybook/storyLoader.gen.js
	kill $$(lsof -t -i :7007) || true
	cd $(PWD) && start-storybook &
	kill $$(lsof -t -i :8081) || true
	cd $(PWD) && PWD=$(PWD) react-native start --reset-cache &
start.storybook: start.storybook.mobile

$(PWD)/storybook/storyLoader.gen.js: $(PWD)/node_modules
	PATH=$(PATH) rnstl \
		--pattern '$(PWD)/../*-storybook/storybook.tsx' \
		--outputFile $(PWD)/storybook/storyLoader.gen.js
	sed -i.bak 's/\(.*\)\.\.\/node_modules\/\(.*\)\/storybook/\1\2\/storybook.tsx/g' $(PWD)/storybook/storyLoader.gen.js
	rm -f $(PWD)/storybook/storyLoader.gen.js.bak

.PHONY: run.storybook.ios
run.storybook.ios: export PWD := $(PWD)
run.storybook.ios: $(PWD)/node_modules $(PWD)/ios/Pods start.storybook.mobile
	cd $(PWD) && react-native run-ios --simulator='iPhone 11' --no-packager
	## cd $(PWD) && react-native run-ios --no-packager

$(PWD)/ios/Pods: $(PWD)/ios/Podfile $(PWD)/node_modules
	cd $(PWD)/ios && pod install

.PHONY: run.storybook.android
run.storybook.android: export PWD := $(PWD)
run.storybook.android: start.storybook.mobile $(PWD)/android/app/debug.keystore
	cd $(PWD) \
		&& clisim -af \
		&& react-native run-android --no-packager

$(PWD)/android/app/debug.keystore: $(HOME)/.android/debug.keystore
	cp $< $@

.PHONY: run.storybook.mobile
run.storybook.mobile: run.storybook.ios run.storybook.android

.PHONY: run.storybook
run.storybook: run.storybook.mobile

.IGNORE \
.PHONY: \
	clean \
	clean.storybook \
	clean.storybook.mobile \
	clean.storybook.ios \
	clean.storybook.android \

clean.storybook.ios: clean.storybook.mobile
clean.storybook.android: clean.storybook.mobile
clean.storybook.mobile:
	watchman watch-del-all
	kill $$(lsof -t -i :7007)
	kill $$(lsof -t -i :8081)
clean.storybook: clean.storybook.mobile
clean: clean.storybook

.IGNORE \
.PHONY: \
	fclean \
	fclean.storybook \
	fclean.storybook.mobile \
	fclean.storybook.ios \
	fclean.storybook.android \

fclean.storybook.ios: export PWD := $(PWD)
fclean.storybook.ios:
	cd $(PWD)/ios; \
		rm -rf build; \
		xcodebuild clean; \
		rm -rf $(HOME)/Library/Developer/Xcode/DerivedData; \
		rm -rf Pods; rm -rf ~/Library/Caches/CocoaPods

fclean.storybook.android: export PWD := $(PWD)
fclean.storybook.android:

fclean.storybook.mobile: export PWD := $(PWD)
fclean.storybook.mobile:
	rm -rf $$TMPDIR/react-native-packager-cache-*
	rm -rf $$TMPDIR/metro-bundler-cache-*
	watchman watch-del-all

fclean.storybook: fclean.storybook.mobile
fclean: fclean.storybook
