export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_root ?= $(abspath $(PWD)/../../..)

react-native := $(PWD)/node_modules/.bin/react-native
clisim := $(PWD)/node_modules/.bin/clisim
pod := pod
bundle := bundle

name ?= berty
platform ?= ios
device ?= iPhone 11
target ?= debug
config ?= development
entry-file ?= index.js
build-dir ?= $(PWD)/build
dest ?= $(build-dir)/$(platform)-$(target)/$(config)

check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "No $(exec) in PATH")))

.DEFAULT_GOAL := run

export ENVFILE ?= $(shell \
	[ -f "$$PWD/.env.$(config)" ] && echo $$PWD/.env.$(config) || echo $$PWD/.env)
.PHONY: config
config: $(ENVFILE)
	@echo $(ENVFILE)
$(ENVFILE):
	$(error "config file $@.$(config) does not exist")

.PHONY: \
	deps \
	deps.ios \
	deps.android \
	deps.web \
	deps.darwin \

deps: $(PWD)/node_modules config

deps.ios: export PWD := $(PWD)
deps.ios: deps build.gobridge.ios $(PWD)/ios/Pods/Manifest.lock /tmp/envfile
$(PWD)/ios/Pods/Manifest.lock: $(PWD)/ios/Podfile $(PWD)/package.json
	([ ! -z "$(shell which pod)" ] \
		&& [[ "$$(pod --version)" > "1.7." ]]) \
		|| sudo gem install cocoapods
	cd $(PWD)/ios && $(pod) install
$(PWD)/ios/Podfile: $(PWD)/node_modules
.PHONY: /tmp/envfile
/tmp/envfile: $(ENVFILE)
	cat $< > $@

deps.android: export PWD := $(PWD)
deps.android: deps build.gobridge.android $(PWD)/node_modules/react-native/react.gradle.orig $(if $(filter $(config), development), $(HOME)/.android/debug.keystore)

$(PWD)/node_modules/react-native/react.gradle.orig: $(PWD)/patch/react.gradle.patch
	@echo "patching file $(patsubst %.orig, %, $@)"
	@patch -f $(patsubst %.orig, %, $@) $< 1>/dev/null || true

deps.web: deps

deps.darwin: deps

.PHONY: start.metro
start.metro: export PWD := $(PWD)
start.metro: port ?= 8081
start.metro: host ?= 127.0.0.1
start.metro: deps
	$(call check-program, lsof)
	$(eval pid := $(shell lsof -t -i :8081 -s TCP:LISTEN))
	@echo Metro pid: $(pid)
	kill -9 $(pid) || true
	@echo "Waiting for metro to die.. ($(shell date))"
	while ps -p $(pid); do sleep 1; done
	@echo "Metro dead ($(shell date))"
	cd $(PWD) && $(react-native) start \
		--reset-cache \
		--port=$(port) \
		--host=$(host)

.PHONY: start.emulator
start.emulator: export PWD := $(PWD)
start.emulator: deps
	$(if $(filter $(platform), android), \
		$(call check-program, adb) \
		$(call check-program, emulator) \
		$(clisim) -af & \
	)
	$(if $(filter $(platform), android), adb wait-for-device || true)

# the adb reverse is for the demo grpc bridge
.PHONY: run
run: export PWD := $(PWD)
run: deps
	$(if $(filter $(platform), android), $(berty_root)/build/shell/check-java.sh 18)
	$(if $(filter $(platform), android), adb -s $(device) reverse tcp:1337 tcp:1337)
	cd $(PWD) && $(react-native) run-$(platform) \
		--no-packager \
		$(if $(filter $(platform), android), --variant=$(target)) \
		$(if $(filter $(platform), android), --deviceId='$(device)') \
		$(if $(filter $(platform), android), \
			$(if $(filter-out $(target), store), --appIdSuffix=$(target))) \
		$(if $(filter $(platform), ios), --configuration=$(if $(filter $(config), development),Debug,Release)) \
		$(if $(filter $(platform), ios), --scheme=$(target)) \
		$(if $(filter $(platform), ios), --simulator='$(device)')

# Use ctrl-b then pageup/pagedown to enter scroll, use escape to exit scroll mode
# Use cltr-b then & to close
# tmux: https://duckduckgo.com/?q=tmux+cheat+sheet&t=ffab&atb=v194-5__&ia=cheatsheet&iax=1
.PHONY: run.%.tmux
run.%.tmux: export PWD := $(PWD)
run.%.tmux: deps
	cd $(berty_root)/js && tmux \
		new-session '$(MAKE) start.metro' \; \
		split-window 'PLATFORM=$* $(berty_root)/build/shell/shortcut_build.sh' \; \
		split-window 'PLATFORM=$* $(MAKE) start.grpc-bridge.orbitdb' \; \
		set-option remain-on-exit on

.PHONY: bundle
bundle: export PWD := $(PWD)
bundle: deps.$(platform)
	cd $(PWD) && $(react-native) bundle \
		--entry-file=$(entry) \
		--platform=$(platform) \
		--bundle-output=$(dest)/main.jsbundle \
		--asset-dest=$(dest) \

.PHONY: \
	release.ios \
	release.ios.debug \
	release.ios.staff \
	release.ios.yolo \
	release.ios.store \
	release.android \
	release.android.debug \
	release.android.staff \
	release.android.yolo \
	release.android.store \
	release.web \
	release.web.debug \
	release.web.staff \
	release.web.yolo \
	release.web.store \
	release.darwin \
	release.darwin.debug \
	release.darwin.staff \
	release.darwin.yolo \
	release.darwin.store \


release.ios.debug: target := debug
release.ios.debug: bundle-id = tech.berty.ios.debug
release.ios.debug: method := development
release.ios.debug: profile := Development
release.ios.debug: team-id := WMBQ84HN4T # @FIXME(gfanton): this should not be public?
release.ios.debug: release.ios
release.ios.staff: target := staff
release.ios.staff: bundle-id = tech.berty.ios.staff
release.ios.staff: method := ad-hoc
release.ios.staff: profile := AdHoc
release.ios.staff: team-id := WMBQ84HN4T # @FIXME(gfanton): this should not be public?
release.ios.staff: release.ios
release.ios.yolo: target := yolo
release.ios.yolo: bundle-id = tech.berty.ios.yolo
release.ios.yolo: method := enterprise
release.ios.yolo: profile := InHouse
release.ios.yolo: team-id := GR5463T564 # @FIXME(gfanton): this should not be public?
release.ios.yolo: release.ios
release.ios.store: target := store
release.ios.store: bundle-id = tech.berty.ios
release.ios.store: method := app-store
release.ios.store: profile := AppStore
release.ios.store: team-id := WMBQ84HN4T # @FIXME(gfanton): this should not be public?
# setup path
release.ios: export PWD := $(PWD)
# setup platform
release.ios: platform := ios
# setup version
release.ios: target_version = $(shell git describe --tags --always | tr - . | sed -E 's`v([0-9]+\.[0-9]+\.[0-9]+)\.?([0-9]*)?.*`\1`g')
release.ios: target_build = $(shell git describe --tags --always | tr - . | sed -E 's`v([0-9]+\.[0-9]+\.[0-9]+)\.?([0-9]*)?.*`\2`g')
# configure fastlane
release.ios: keychain-name ?= berty_keychain
release.ios: keychain-password ?= berty_pass
release.ios: git-url ?= git@github.com:berty/berty-ios-certs # @FIXME(gfanton): this should not be public?
release.ios: export FL_BUILDLOG_PATH=$(dest)
release.ios: export KEYCHAIN_NAME=$(keychain-name)
release.ios: export KEYCHAIN_PASSWORD=$(keychain-password)
release.ios: export MATCH_KEYCHAIN_NAME=$(keychain-name)
release.ios: export MATCH_KEYCHAIN_PASSWORD=$(keychain-password)
release.ios: export GYM_CLEAN=false
release.ios: export GYM_EXPORT_METHOD=$(method)
release.ios: export GYM_OPTION_METHOD=$(method)
release.ios: export GYM_OPTION_APP_ID=$(bundle-id)
release.ios: export GYM_OPTION_PROVISIONING_PROFILE=match $(profile) $(bundle-id)
release.ios: export GYM_OUTPUT_NAME=$(shell echo $(name) | $(PWD)/node_modules/.bin/caser --pascal)
release.ios: export GYM_OUTPUT_DIRECTORY=$(dest)
release.ios: export GYM_WORKSPACE=$(PWD)/ios/$(shell echo $(name) | $(PWD)/node_modules/.bin/caser --pascal).xcworkspace
release.ios: export GYM_SCHEME=$(target)
release.ios: export GYM_SKIP_PROFILE_DETECTION=true
release.ios: export GYM_INCLUDE_SYMBOLS=false
release.ios: deps.ios
	$(if $(profile),, $(error "profile variable not defined"))
	$(if $(method),, $(error "method variable not defined"))

	# gem bundle install
	cd $(PWD) \
		&& $(bundle) install

	# setup ci if needed
ifdef CI
	cd $(PWD) \
		`# create temporary keychain` \
		&& $(bundle) exec fastlane run create_keychain \
			timeout:3600 \
			default_keychain:true \
			unlock:true \
			add_to_search_list:true \
		`# setup app version` \
		&& plutil -replace CFBundleShortVersionString -string $(target_version) $(PWD)/ios/Berty/Info.plist \
		&& plutil -replace CFBundleVersion -string $(target_build) $(PWD)/ios/Berty/Info.plist

endif

	cd $(PWD) \
		`# get ios certificates` \
		&& $(bundle) exec fastlane run match \
			type:$(shell echo $(method) | sed 's/-//g') \
			app_identifier:$(bundle-id) \
			team_id:$(team-id) \
			readonly:true \
			$(if $(git-url), git_url:$(git-url)) \
		`# build` \
		&& time $(bundle) exec fastlane ios build --verbose

release.android.debug:
release.android.staff:
release.android.yolo:
release.android.store:
release.android:
release.web.debug:
release.web.staff:
release.web.yolo:
release.web.store:
release.web:
release.darwin.debug:
release.darwin.staff:
release.darwin.yolo:
release.darwin.store:
release.darwin:

.PHONY: log
log:
	cd $(PWD) && $(react-native) log-$(platform)

# HELPERS

.PHONY: \
	config.development \
	config.production \

config.development: config := development
config.production: config := production

.PHONY: \
	start.metro.android \
	start.metro.ios \
	start.metro.web \
	start.metro.darwin \

start.metro.ios: platform := ios
start.metro.ios: start.metro
start.metro.android: platform := android
start.metro.android: start.metro
start.metro.web: platform := web
start.metro.web: start.metro
start.metro.darwin: platform := darwin
start.metro.darwin: start.metro

.PHONY: \
	log.android \
	log.ios \
	log.web \
	log.darwin \

log.ios: platform := ios
log.ios: log
log.android: platform := android
log.android: log
log.web: platform := web
log.web: log
log.darwin: platform := darwin
log.darwin: log

.PHONY: \
	bundle.android \
	bundle.android.debug \
	bundle.android.staff \
	bundle.android.yolo \
	bundle.android.store \
	bundle.ios \
	bundle.ios.debug \
	bundle.ios.staff \
	bundle.ios.yolo \
	bundle.ios.store \
	bundle.web \
	bundle.web.debug \
	bundle.web.staff \
	bundle.web.yolo \
	bundle.web.store \
	bundle.darwin \
	bundle.darwin.staff \
	bundle.darwin.yolo \
	bundle.darwin.store \

bundle.ios.debug: config := development
bundle.ios.debug: target := debug
bundle.ios.debug: bundle.ios
bundle.ios.staff: config := production
bundle.ios.staff: target := staff
bundle.ios.staff: bundle.ios
bundle.ios.yolo: config := production
bundle.ios.yolo: target := yolo
bundle.ios.yolo: bundle.ios
bundle.ios.store: config := production
bundle.ios.store: target := store
bundle.ios.store: bundle.ios
bundle.ios: platform := ios
bundle.ios: bundle

bundle.android.debug: config := development
bundle.android.debug: target := debug
bundle.android.debug: bundle.android
bundle.android.staff: config := production
bundle.android.staff: target := staff
bundle.android.staff: bundle.android
bundle.android.yolo: config := production
bundle.android.yolo: target := yolo
bundle.android.yolo: bundle.android
bundle.android.store: config := production
bundle.android.store: target := store
bundle.android.store: bundle.android
bundle.android: platform := android
bundle.android: bundle

bundle.web.debug: config := development
bundle.web.debug: target := debug
bundle.web.debug: bundle.web
bundle.web.staff: config := production
bundle.web.staff: target := staff
bundle.web.staff: bundle.web
bundle.web.yolo: config := production
bundle.web.yolo: target := yolo
bundle.web.yolo: bundle.web
bundle.web.store: config := production
bundle.web.store: target := store
bundle.web.store: bundle.web
bundle.web: platform := web
bundle.web: bundle

bundle.darwin.debug: config := development
bundle.darwin.debug: target := debug
bundle.darwin.debug: bundle.darwin
bundle.darwin.staff: config := production
bundle.darwin.staff: target := staff
bundle.darwin.staff: bundle.darwin
bundle.darwin.yolo: config := production
bundle.darwin.yolo: target := yolo
bundle.darwin.yolo: bundle.darwin
bundle.darwin.store: config := production
bundle.darwin.store: target := store
bundle.darwin.store: bundle.darwin
bundle.darwin: platform := darwin
bundle.darwin: bundle

.PHONY: \
	run.ios \
	run.ios.debug \
	run.ios.staff \
	run.ios.yolo \
	run.ios.store \
	run.android \
	run.android.debug \
	run.android.staff \
	run.android.yolo \
	run.android.store \
	run.web \
	run.web.debug \
	run.web.staff \
	run.web.yolo \
	run.web.store \
	run.darwin \
	run.darwin.staff \
	run.darwin.yolo \
	run.darwin.store \

run.ios.debug: config := development
run.ios.debug: target := debug
run.ios.debug: run.ios
run.ios.staff: config := production
run.ios.staff: target := staff
run.ios.staff: run.ios
run.ios.yolo: config := production
run.ios.yolo: target := yolo
run.ios.yolo: run.ios
run.ios.store: config := production
run.ios.store: target := store
run.ios.store: run.ios
run.ios: platform := ios
run.ios: deps.ios run

run.android.debug: config := development
run.android.debug: target := debug
run.android.debug: run.android
run.android.staff: config := production
run.android.staff: target := staff
run.android.staff: run.android
run.android.yolo: config := production
run.android.yolo: target := yolo
run.android.yolo: run.android
run.android.store: config := production
run.android.store: target := store
run.android.store: run.android
run.android: platform := android
run.android: device := $(shell which adb >/dev/null && (adb devices | tail +2 | head -1 | cut -f 1) || echo "missing-adb-binary")
run.android: deps.android run

run.web.debug: config := development
run.web.debug: target := debug
run.web.debug: run.web
run.web.staff: config := production
run.web.staff: target := staff
run.web.staff: run.web
run.web.yolo: config := production
run.web.yolo: target := yolo
run.web.yolo: run.web
run.web.store: config := production
run.web.store: target := store
run.web.store: run.web
run.web: platform := web
run.web: deps.web run

run.darwin.debug: config := development
run.darwin.debug: target := debug
run.darwin.debug: run.darwin
run.darwin.staff: config := production
run.darwin.staff: target := staff
run.darwin.staff: run.darwin
run.darwin.yolo: config := production
run.darwin.yolo: target := yolo
run.darwin.yolo: run.darwin
run.darwin.store: config := production
run.darwin.store: target := store
run.darwin.store: run.darwin
run.darwin: platform := darwin
run.darwin: deps.darwin run

.IGNORE \
.PHONY: \
	clean.ios \
	clean.android \
	clean.web \
	clean.darwin \
	clean \


clean.ios: platform := ios
clean.ios: export PWD := $(PWD)
clean.ios:
	touch $(PWD)/ios/Podfile
clean.android: export PWD := $(PWD)
clean.android: platform := android
clean.android:
	cd $(PWD)/android; \
		./gradlew clean; \
		rm -rf .gradle; \

clean.web: platform := web
clean.web:
clean.darwin: platform := darwin
clean.darwin:
clean:
	kill $$(lsof -t -i :8081)

.IGNORE \
.PHONY: \
	fclean.ios \
	fclean.android \
	fclean.web \
	fclean.darwin \
	fclean \

fclean.ios: platform := ios
fclean.ios: export PWD := $(PWD)
fclean.ios:
	cd $(PWD)/ios; \
		rm -rf build; \
		xcodebuild clean; \
		rm -rf $(HOME)/Library/Developer/Xcode/DerivedData; \
		rm -rf Pods; rm -rf ~/Library/Caches/CocoaPods
fclean.android: platform := android
fclean.android: clean.android
	cd $(PWD)/android; \
		rm -rf app/build; \
		rm -rf $$HOME/.gradle/caches;
fclean.web: platform := web
fclean.web:
fclean.darwin: platform := darwin
fclean.darwin:
fclean: fclean.ios fclean.android fclean.darwin fclean.web


# FIXME(@n0izn0iz): this make rule doesn't work out of the box for me:
# the problem is here https://github.com/berty/berty/pull/1447/files#diff-7231a913a8b27c628fe4fa6137140148R16
# - if we keep using bazel-managed dependencies the label should be @npm//:node_modules/etc..
# - if we don't: we should call lerna bootstrap or some other form of npm install
#   in this make rule or as a dependency of it
bazel.android.install:
	$(MAKE) -C $(abspath $(PWD)/../go-bridge) bazel.build.gobridge.android
	bazel mobile-install --sandbox_debug --fat_apk_cpu=x86_64,x86,armeabi-v7a //android/app/src/main:app
