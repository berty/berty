## Utils
check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))

#### iOS
ios/vendor/bundle: ios/Gemfile
	$(call check-program, bundle)
	cd ios && bundle install
	touch $@

ios/miniGame.xcworkspace: node_modules ios/vendor/bundle ios/Podfile
	$(call check-program, bundle)
	cd ios && bundle exec pod install --repo-update
	touch $@

.PHONY: ios
ios: ios/miniGame.xcworkspace
	$(call check-program, npx)
	npx react-native run-ios

#### Android
.PHONY: android
android: node_modules
	$(call check-program, npx)
	npx react-native run-android

#### Misc.
node_modules: package.json
	$(call check-program, yarn)
	yarn
	touch $@

.PHONY: clean
clean:
	$(call check-program, yarn)
	# React-native cmd
	yarn cache clean -f

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
	rm -rf ios/vendor

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
