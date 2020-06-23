storybookmobile_pwd=$(shell pwd)/packages/storybook-mobile

.PHONY: \
	start.storybook \
	start.storybook.mobile\

start.storybook.mobile: export PWD := $(storybookmobile_pwd)
start.storybook.mobile: $(storybookmobile_pwd)/node_modules $(storybookmobile_pwd)/storybook/storyLoader.gen.js
	kill $$(lsof -t -i :7007) || true
	cd $(storybookmobile_pwd) && start-storybook &
	kill $$(lsof -t -i :8081) || true
	cd $(storybookmobile_pwd) && PWD=$(storybookmobile_pwd) react-native start --reset-cache &
start.storybook: start.storybook.mobile

$(storybookmobile_pwd)/storybook/storyLoader.gen.js: $(storybookmobile_pwd)/node_modules
	PATH=$(PATH) rnstl \
		--pattern '$(storybookmobile_pwd)/../*-storybook/storybook.tsx' \
		--outputFile $(storybookmobile_pwd)/storybook/storyLoader.gen.js
	sed -i.bak 's/\(.*\)\.\.\/node_modules\/\(.*\)\/storybook/\1\2\/storybook.tsx/g' $(storybookmobile_pwd)/storybook/storyLoader.gen.js
	rm -f $(storybookmobile_pwd)/storybook/storyLoader.gen.js.bak

.PHONY: run.storybook.ios
run.storybook.ios: export PWD := $(storybookmobile_pwd)
run.storybook.ios: $(storybookmobile_pwd)/node_modules $(storybookmobile_pwd)/ios/Pods start.storybook.mobile
	cd $(storybookmobile_pwd) && react-native run-ios --simulator='iPhone 11' --no-packager
	## cd $(storybookmobile_pwd) && react-native run-ios --no-packager

$(storybookmobile_pwd)/ios/Pods: $(storybookmobile_pwd)/ios/Podfile $(storybookmobile_pwd)/node_modules
	cd $(storybookmobile_pwd)/ios && pod install

.PHONY: run.storybook.android
run.storybook.android: export PWD := $(storybookmobile_pwd)
run.storybook.android: start.storybook.mobile $(storybookmobile_pwd)/android/app/debug.keystore
	cd $(storybookmobile_pwd) \
		&& clisim -af \
		&& react-native run-android --no-packager

$(storybookmobile_pwd)/android/app/debug.keystore: $(HOME)/.android/debug.keystore
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

fclean.storybook.ios: export PWD := $(storybookmobile_pwd)
fclean.storybook.ios:
	cd $(storybookmobile_pwd)/ios; \
		rm -rf build; \
		xcodebuild clean; \
		rm -rf $(HOME)/Library/Developer/Xcode/DerivedData; \
		rm -rf Pods; rm -rf ~/Library/Caches/CocoaPods

fclean.storybook.android: export PWD := $(storybookmobile_pwd)
fclean.storybook.android:

fclean.storybook.mobile: export PWD := $(storybookmobile_pwd)
fclean.storybook.mobile:
	rm -rf $$TMPDIR/react-native-packager-cache-*
	rm -rf $$TMPDIR/metro-bundler-cache-*
	watchman watch-del-all

fclean.storybook: fclean.storybook.mobile
fclean: fclean.storybook
