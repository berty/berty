## User variables

METRO_RN_PORT ?= 8081
IOS_UDID ?= --udid
IOS_RN_FLAGS ?=
IOS_DEVICE ?=
ANDROID_DEVICE ?=

## Internal variables

kill-program-using-port = $(foreach port,$(1),$(eval pid ?= $(shell lsof -t -i :$(port))) $(if $(pid),$(shell kill $(pid)),))
check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))

#### iOS

.PHONY: ios.pod
ios.pod:
	bundle install
	cd ios && bundle exec pod install --repo-update

.PHONY: ios
ios: ios.pod
	$(call check-program, npx)
	npx react-native run-ios \
		--port="$(METRO_RN_PORT)" \
		$(if $(IOS_DEVICE),$(IOS_UDID)='$(IOS_DEVICE)',) \
		$(IOS_RN_FLAGS)

#### Android

.PHONY: android
android:
	$(call check-program, npx)
	npx react-native run-android \
		--no-packager \
		--port="$(METRO_RN_PORT)"

#### React-Native

.PHONY: metro.start
metro.start:
	npx react-native start --port=$(METRO_RN_PORT)

.PHONY: clean
clean:
	# React-native cmd
	yarn cache clean -f
	$(call kill-program-using-port, $(METRO_RN_PORT))

	# Android cmd
	cd android && ./gradlew clean || true

	# iOS cmd
ifneq (, $(shell which xcodebuild))
	cd ios && xcodebuild clean || true
endif


	# React-native files
	rm -rf node_modules
	rm -rf /tmp/react-native-packager-cache-*
	rm -rf /tmp/metro-bundler-cache-*

	# iOS files
	rm -rf ios/Pods

	# Android files
	rm -rf android/.gradle
	rm -rf android/build
	rm -rf android/app/build

	# Help complementary cleaning
	@echo ""
	@echo "Cleaned. Now you may consider clearing some of your system cache with one of the following commands."
	@echo ""
	@echo "  rm -rf $(HOME)/.gradle/caches"
	@echo "  rm -rf $(HOME)/Library/Developer/Xcode/DerivedData"
	@echo "  rm -rf $(HOME)/Library/Caches/CocoaPods"
