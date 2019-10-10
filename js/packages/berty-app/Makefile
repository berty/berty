export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export SHELL := /bin/bash

react-native := $(PWD)/node_modules/.bin/react-native
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

.DEFAULT_GOAL := run

export ENVFILE ?= $(shell \
	[ -f "$$PWD/.env.$(config)" ] && echo $$PWD/.env.$(config) || echo $$PWD/.env)
.PHONY: config
config: $(ENVFILE)
	@echo $(ENVFILE)
$(ENVFILE):
	$(error "config file $@ does not exist")

.PHONY: \
	deps \
	deps.ios \
	deps.android \
	deps.web \
	deps.darwin \

deps: $(PWD)/node_modules config

deps.ios: export PWD := $(PWD)
deps.ios: deps $(PWD)/ios/Pods/Manifest.lock /tmp/envfile
$(PWD)/ios/Pods/Manifest.lock: $(PWD)/ios/Podfile
	([ ! -z "$(shell which pod)" ] \
		&& [[ "$$(pod --version)" > "1.7." ]]) \
		|| sudo gem install cocoapods
	cd $(PWD)/ios && $(pod) install
$(PWD)/ios/Podfile: $(PWD)/node_modules
.PHONY: /tmp/envfile
/tmp/envfile: $(ENVFILE)
	cat $< > $@

deps.android: deps deps.react-native-core.android

deps.web: deps

deps.darwin: deps

.PHONY: start
start: port ?= 8081
start: host ?= 127.0.0.1
start: deps
	lsof -t -i :$(port) || $(react-native) start \
		--port=$(port) \
		--host=$(host) \
		& \

.PHONY: run
run: export PWD := $(PWD)
run: deps $(if $(filter $(target), debug), start)
	$(if $(filter $(platform), android), \
		$(if $(filter $(config), development), ANDROID_SDK_ROOT=$$HOME/.android clisim -af))
	cd $(PWD) && $(react-native) run-$(platform) \
		--no-packager \
		$(if $(filter $(platform), android), --variant=$(target)) \
		$(if $(filter $(platform), ios), --configuration=$(target)) \
		$(if $(filter $(platform), ios), --scheme=$(target)) \
		$(if $(filter $(platform), ios), $(if $(filter $(config), development), --simulator='$(device)')) \

.PHONY: bundle
bundle: deps
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
release.ios.debug: method := development
release.ios.debug: profile := Development
release.ios.debug: team-id := WMBQ84HN4T
release.ios.debug: release.ios
release.ios.staff: target := staff
release.ios.staff: method := ad-hoc
release.ios.staff: profile := AdHoc
release.ios.staff: team-id := WMBQ84HN4T
release.ios.staff: release.ios
release.ios.yolo: target := yolo
release.ios.yolo: method := enterprise
release.ios.yolo: profile := InHouse
release.ios.yolo: team-id := WMBQ84HN4T
release.ios.yolo: release.ios
release.ios.store: target := store
release.ios.store: method := app-store
release.ios.store: profile := AppStore
release.ios.store: team-id := GR5463T564
release.ios.store: release.ios
release.ios: platform := ios
release.ios: bundle-id = chat.berty.ios.$(target)
release.ios: version = $(shell git describe --tags --always  | cut -d - -f 1,2 | tr - .| tail -c +2)
release.ios: keychain-name ?= berty_keychain
release.ios: keychain-password ?= berty_pass
release.ios: git-url ?= git@github.com:berty/berty-ios-certs
release.ios: export FL_BUILDLOG_PATH = $(dest)
release.ios: export GYM_CLEAN = false
release.ios: export GYM_OPTION_METHOD = $(method)
release.ios: export GYM_OPTION_APP_ID = $(bundle-id)
release.ios: export GYM_OPTION_PROVISIONING_PROFILE = "match $(profile) $(bundle-id)"
release.ios: export GYM_OUTPUT_NAME = $(shell echo $(name) | caser --pascal)
release.ios: export GYM_OUTPUT_DIRECTORY = $(dest)
release.ios: export GYM_WORKSPACE = $(PWD)/ios/$(shell echo $(name) | caser --pascal).xcworkspace
release.ios: export GYM_SCHEME = $(target)
release.ios: export GYM_SKIP_PROFILE_DETECTION = true
release.ios: export GYM_INCLUDE_SYMBOLS = false
release.ios: deps.ios
	$(if $(profile),, $(error "profile variable not defined"))
	$(if $(method),, $(error "method variable not defined"))
	# fetch app store profile
	cd $(PWD) \
		&& $(bundle) exec fastlane run match \
			type:$(shell echo $(method) | sed 's/-//g') \
			app_identifier:$(bundle-id) \
			readonly:true \
			team_id:$(team-id) \
			$(if $(git-url), git_url:$(git-url)) \
		&& time $(bundle) exec fastlane $(platform) build --verbose

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
	start.android \
	start.ios \
	start.web \
	start.darwin \

start.ios: platform := ios
start.ios: start
start.android: platform := android
start.android: start
start.web: platform := web
start.web: start
start.darwin: platform := darwin
start.darwin: start

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

bundle.ios.debug: target := debug
bundle.ios.debug: bundle.ios
bundle.ios.staff: target := staff
bundle.ios.staff: bundle.ios
bundle.ios.yolo: target := yolo
bundle.ios.yolo: bundle.ios
bundle.ios.store: target := store
bundle.ios.store: bundle.ios
bundle.ios: platform := ios
bundle.ios: bundle

bundle.android.debug: target := debug
bundle.android.debug: bundle.android
bundle.android.staff: target := staff
bundle.android.staff: bundle.android
bundle.android.yolo: target := yolo
bundle.android.yolo: bundle.android
bundle.android.store: target := store
bundle.android.store: bundle.android
bundle.android: platform := android
bundle.android: bundle

bundle.web.debug: target := debug
bundle.web.debug: bundle.web
bundle.web.staff: target := staff
bundle.web.staff: bundle.web
bundle.web.yolo: target := yolo
bundle.web.yolo: bundle.web
bundle.web.store: target := store
bundle.web.store: bundle.web
bundle.web: platform := web
bundle.web: bundle

bundle.darwin.debug: target := debug
bundle.darwin.debug: bundle.darwin
bundle.darwin.staff: target := staff
bundle.darwin.staff: bundle.darwin
bundle.darwin.yolo: target := yolo
bundle.darwin.yolo: bundle.darwin
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

run.ios.debug: target := debug
run.ios.debug: device := iPhone 11
run.ios.debug: run.ios
run.ios.staff: target := staff
run.ios.staff: run.ios
run.ios.yolo: target := yolo
run.ios.yolo: run.ios
run.ios.store: target := store
run.ios.store: run.ios
run.ios: platform := ios
run.ios: deps.ios run

run.android.debug: target := debug
run.android.debug: run.android
run.android.staff: target := staff
run.android.staff: run.android
run.android.yolo: target := yolo
run.android.yolo: run.android
run.android.store: target := store
run.android.store: run.android
run.android: platform := android
run.android: deps.android run

run.web.debug: target := debug
run.web.debug: run.web
run.web.staff: target := staff
run.web.staff: run.web
run.web.yolo: target := yolo
run.web.yolo: run.web
run.web.store: target := store
run.web.store: run.web
run.web: platform := web
run.web: deps.web run

run.darwin.debug: target := debug
run.darwin.debug: run.darwin
run.darwin.staff: target := staff
run.darwin.staff: run.darwin
run.darwin.yolo: target := yolo
run.darwin.yolo: run.darwin
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
clean.android: platform := android
clean.android:
clean.web: platform := web
clean.web:
clean.darwin: platform := darwin
clean.darwin:
clean:

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
fclean.android:
fclean.web: platform := web
fclean.web:
fclean.darwin: platform := darwin
fclean.darwin:
fclean: fclean.ios fclean.android fclean.darwin fclean.web
