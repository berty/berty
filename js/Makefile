## User variables

VERSION ?= `go run -mod=readonly -modfile=../go.mod github.com/mdomke/git-semver/v5`
VCS_REF ?= `git rev-parse --short HEAD`
BUILD_DATE ?= `date +%s`
TMP ?= /tmp
CI ?= false
BERTY_DAEMON_HOST ?= 127.0.0.1
BERTY_DAEMON_PORT ?= 1337
BERTY_DAEMON_OPTS ?= -p2p.webui-listener=""
BERTY_DAEMON_STORE ?= -store.dir=$(BERTY_DAEMON_PORT).db.d
STORYBOOK_MOBILE_PORT ?= 7007
STORYBOOK_WEB_PORT ?= 7008
METRO_RN_PORT ?= 8081
IOS_DEVICE ?=
ANDROID_DEVICE ?=

## Internal variables

rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))
kill-program-using-port = $(foreach port,$(1),$(eval pid ?= $(shell lsof -t -i :$(port))) $(if $(pid),$(shell kill $(pid)),))
export PATH := $(PWD)/node_modules/.bin:$(PATH)
author = Berty Technologies <oss@berty.tech>
ext_ldflags = -ldflags="-X berty.tech/berty/v2/go/pkg/bertyversion.VcsRef=$(VCS_REF) -X berty.tech/berty/v2/go/pkg/bertyversion.Version=$(VERSION)"
pkg := $(dir $(wildcard $(PWD)/packages/*/package.json))
pkg_mod := $(patsubst %, %/node_modules, $(pkg)) node_modules
pkg_desc := $(patsubst %, %/package.json, $(pkg)) package.json
bridge_src := $(call rwildcard,../go,*.go *.m *.h) ../go.sum
react-native := $(abspath node_modules/.bin/react-native)
xcodegen_yml := $(wildcard $(PWD)/packages/berty-app/ios/*.yaml)
xcodegen_ver = $(shell cat XcodeGen.version)
required_java_ver = 18
minimum_ios_ver = 12.0
minimum_android_ver = 21

## User commands

###############
# Misc. rules #
###############

#### Help

.PHONY: help
help:
	@echo "  User command         Description                             Main env options"
	@echo "  android.debug        Launch Android app in debug mode        ANDROID_DEVICE=<virtual/real device>"
	@echo "  android.release      Launch Android app in release mode      ANDROID_DEVICE=<virtual/real device>"
	@echo "  android.storybook    Launch Android storybook"
	@echo "  daemon.start         Start Go Berty daemon                   BERTY_DAEMON_PORT=1337"
	@echo "  daemon.start.docker  Start Dockerized Go Berty daemon        BERTY_DAEMON_PORT=1337"
	@echo "  clean                Clear deps, cache and built objects"
	@echo "  generate             Use Protobuf to generate files"
	@echo "  ios.debug            Launch iOS app in debug mode            IOS_DEVICE=<virtual/real device>"
	@echo "  ios.release          Launch iOS app in release mode          IOS_DEVICE=<virtual/real device>"
	@echo "  ios.storybook        Launch iOS storybook"
	@echo "  lint                 Run eslint"
	@echo "  lint.fix             Run eslint and fix erros"
	@echo "  lint.quick           Run eslint without verifying deps"
	@echo "  metro.start          Start React-Native Metro (app debug)"
	@echo "  regenerate           Clean and generate Protobuf files"
	@echo "  test                 Run tests"
	@echo "  test.quick           Run tests without verifying deps"
	@echo "  web.storybook        Launch web storybook"

#### Test

.PHONY: test
test: node_mod
	yarn test

.PHONY: test.quick
test.quick:
	yarn test

#### Gen

.PHONY: generate
generate: node_mod gen.sum

.PHONY: regenerate
regenerate: gen.clean generate

#### Clean

.PHONY: clean
clean:
	# React-Native cmd
	yarn cache clean -f
	$(call kill-program-using-port, $(METRO_RN_PORT))
	$(call kill-program-using-port, $(STORYBOOK_WEB_PORT))
	$(call kill-program-using-port, $(STORYBOOK_MOBILE_PORT))
	# Android cmd
	cd packages/berty-app/android && ./gradlew clean || true

	# iOS cmd
ifneq (, $(shell which xcodebuild))
	cd packages/berty-app/ios && xcodebuild clean || true
	cd packages/storybook-mobile/ios && xcodebuild clean || true
endif

	# React-Native files
	rm -rf .tmp
	rm -rf $(pkg_mod)
	rm -rf $(TMP)/react-native-packager-cache-*
	rm -rf $(TMP)/metro-bundler-cache-*
	rm -rf .eslintcache

	# Android files
	rm -rf packages/berty-app/android/.gradle
	rm -rf packages/berty-app/android/build
	rm -rf packages/berty-app/android/app/build
	rm -f packages/go-bridge/android/libs/gobridge.aar

	# iOS files
	rm -rf packages/berty-app/ios/build
	rm -rf packages/berty-app/ios/Pods
	rm -rf packages/go-bridge/ios/Frameworks/Bertybridge.framework
	rm -rf vendor
	rm -rf packages/berty-app/ios/Berty.xcodeproj
	rm -rf packages/berty-app/ios/Berty.xcworkspace
	rm -rf packages/storybook-mobile/ios/build
	rm -rf packages/storybook-mobile/ios/Pods

	# Help complementary cleaning
	@echo ""
	@echo "Cleaned. Now you may consider clearing some of your system cache with one of the following commands."
	@echo ""
	@echo "  rm -rf $(HOME)/.gradle/caches"
	@echo "  rm -rf $(HOME)/Library/Developer/Xcode/DerivedData"
	@echo "  rm -rf $(HOME)/Library/Caches/CocoaPods"

.PHONY: gen.clean
gen.clean:
	rm -f gen.sum
	rm -f $(wildcard \
	  packages/*/*.gen.tsx \
	  packages/*/*.gen.js \
	  packages/*/*.pb.js \
	  packages/*/*.pb.d.ts \
	)
	@#TODO add more generated files here

#### Lint

.PHONY: lint
lint: node_mod
	cp .gitignore .eslintignore
	echo '*.pb.*' >> .eslintignore
	echo '*.gen.*' >> .eslintignore
	eslint --cache --quiet --ext=.js,.jsx,.ts,.tsx .

.PHONY: lint.fix
lint.fix: node_mod
	eslint --fix .

.PHONY: lint.quick
lint.quick:
	cp .gitignore .eslintignore
	echo '*.pb.*' >> .eslintignore
	echo '*.gen.*' >> .eslintignore
	eslint --cache --quiet --ext=.js,.jsx,.ts,.tsx .

###################
# Build/Run rules #
###################

#### iOS

.PHONY: ios.app_deps
ios.app_deps: node_mod ios.gomobile ios.project

.PHONY: ios.debug
ios.debug: ios.app_deps
	cd packages/berty-app && $(react-native) run-ios --no-packager --configuration='Debug' --scheme='Berty Debug' $(if $(IOS_DEVICE),--simulator='$(IOS_DEVICE)',)

.PHONY: ios.release
ios.release: ios.app_deps
	cd packages/berty-app && $(react-native) run-ios --no-packager --configuration='AppStore Release' --scheme='Berty AppStore'  $(if $(IOS_DEVICE),--simulator='$(IOS_DEVICE)',)

.PHONY: ios.log
ios.log:
	cd packages/berty-app && $(react-native) log-ios

.PHONY: ios.storybook
ios.storybook: node_mod packages/storybook-mobile/ios/Pods _storybook.mobile.start
	$(call kill-program-using-port, $(METRO_RN_PORT), $(STORYBOOK_MOBILE_PORT))
	cd packages/storybook-mobile && start-storybook &
	cd packages/storybook-mobile && PWD=$(abspath packages/storybook-mobile) $(react-native) start --reset-cache &
	cd packages/storybook-mobile && $(react-native) run-ios --simulator='$(IOS_DEVICE)' --no-packager

.PHONY: ios.project
ios.project: packages/berty-app/ios/Berty.xcworkspace

.PHONY: ios.gomobile
ios.gomobile: packages/go-bridge/ios/Frameworks/Bertybridge.framework

#### Android

.PHONY: android.app_deps
android.app_deps: node_mod android.gomobile packages/berty-app/node_modules/react-native/react.gradle.orig packages/berty-app/android/app/debug.keystore

.PHONY: android.debug
android.debug: android.app_deps
	$(eval CURRENT_JAVA_VER ?= `java -version 2>&1 | sed -n ';s/.* version "\(.*\)\.\(.*\)\..*"/\1\2/p;'`)
	@if [ "$(CURRENT_JAVA_VER)" != "$(required_java_ver)" ]; then \
	  >&2 echo "ERROR: Invalid java version, want $(required_java_ver), got $(CURRENT_JAVA_VER)"; exit 1; \
	fi
	cd packages/berty-app && $(react-native) run-android --no-packager --variant=Debug $(if $(ANDROID_DEVICE),--deviceId='$(ANDROID_DEVICE)',)

.PHONY: android.release
android.release: android.app_deps
	$(eval CURRENT_JAVA_VER ?= `java -version 2>&1 | sed -n ';s/.* version "\(.*\)\.\(.*\)\..*"/\1\2/p;'`)
	@if [ "$(CURRENT_JAVA_VER)" != "$(required_java_ver)" ]; then \
	  >&2 echo "ERROR: Invalid java version, want $(required_java_ver), got $(CURRENT_JAVA_VER)"; exit 1; \
	fi
	cd packages/berty-app && $(react-native) run-android --no-packager --variant=Store $(if $(ANDROID_DEVICE),--deviceId='$(ANDROID_DEVICE)',)

.PHONY: android.gomobile
android.gomobile: packages/go-bridge/android/libs/gobridge.aar

.PHONY: android.log
android.log:
	cd packages/berty-app && $(react-native) log-android

.PHONY: android.emulator
android.emulator:
	$(call check-program, adb emulator)
	$(eval ANDROID_EMULATOR ?= `emulator -list-avds | head -n1`)
	@if [ -z "$(ANDROID_EMULATOR)" ]; then \
	  >&2 echo "ERROR: no Android emulator AVD found"; exit 1; \
	fi
	emulator @$(ANDROID_EMULATOR) -logcat *:i

.PHONY: android.reverse_tcp
android.reverse_tcp:
	$(call check-program, adb)
	$(eval ANDROID_DEVICE ?= `adb devices | tail +2 | head -1 | cut -f 1`)
	@if [ -z "$(ANDROID_DEVICE)" ]; then \
	  >&2 echo "ERROR: no Android device found"; exit 1; \
	fi
	adb -s $(ANDROID_DEVICE) reverse tcp:$(BERTY_DAEMON_PORT) tcp:$(BERTY_DAEMON_PORT) # daemon
	adb -s $(ANDROID_DEVICE) reverse tcp:8081 tcp:8081 # metro

.PHONY: android.storybook
android.storybook: node_mod start.storybook.mobile packages/storybook-mobile/android/app/debug.keystore
	cd packages/storybook-mobile && $(react-native) run-android --no-packager

#### Web

.PHONY: web.storybook
web.storybook: node_mod
	$(call kill-program-using-port, $(STORYBOOK_WEB_PORT))
	cd packages/storybook-web && echo Y | start-storybook --port=$(STORYBOOK_WEB_PORT) -c lib &

.PHONY: web-dev-app.start
web-dev-app.start:
	cd packages/web-dev-app && yarn && yarn start

#### React

.PHONY: metro.start
metro.start: node_mod
	$(call kill-program-using-port, $(METRO_RN_PORT))
	cd packages/berty-app && $(react-native) start --reset-cache --port=$(METRO_RN_PORT) --host=127.0.0.1

.PHONY: node_mod
node_mod: $(pkg_mod)

#### Go daemon

.PHONY: daemon.start
daemon.start:
	cd ../go && $(MAKE) install
	`go env GOPATH`/bin/berty $(BERTY_OPTS) daemon -node.listeners=/ip4/$(BERTY_DAEMON_HOST)/tcp/$(BERTY_DAEMON_PORT)/grpcws $(BERTY_DAEMON_STORE) $(BERTY_DAEMON_OPTS)

.PHONY: daemon.start.docker
daemon.start.docker:
	$(call check-program, docker)
	docker run -it --rm -p $(BERTY_DAEMON_PORT):$(BERTY_DAEMON_PORT) bertytech/berty $(BERTY_OPTS) daemon -node.listeners=/ip4/0.0.0.0/tcp/$(BERTY_DAEMON_PORT)/grpcws -p2p.webui-listener=""

#### Gen

##### pbhbs based code generation

pbhbs_templates := packages/api/index.gen.js.hbs packages/codegen/index.gen.js.hbs
pbhbs_targets := $(patsubst %.hbs,%,$(pbhbs_templates))
pbhbs_flags := -p ../api -p node_modules/@googleapis/googleapis -p `cd ..; go list -m -mod=mod -f {{.Dir}} github.com/grpc-ecosystem/grpc-gateway`/third_party/googleapis -p `cd ..; go list -m -mod=mod -f {{.Dir}} github.com/gogo/protobuf` -p node_modules/@protocolbuffers/protobuf/src -H packages/codegen/helpers
.PHONY: _gen.pbhbs
_gen.pbhbs:
	pbhbs $(pbhbs_flags) -t packages/components  -o packages/components  ../api/bertyprotocol.proto  ../api/bertymessenger.proto ../api/bertytypes.proto
	pbhbs $(pbhbs_flags) -t packages/api         -o packages/api         ../api/bertyprotocol.proto  ../api/bertymessenger.proto ../api/bertytypes.proto
	pbhbs $(pbhbs_flags) -t packages/codegen     -o packages/codegen     ../api/bertyprotocol.proto  ../api/bertymessenger.proto ../api/bertytypes.proto
	eslint --cache --quiet --fix --no-ignore $(pbhbs_targets)

##### pbjs

pbjs_flags := -p ../api -p node_modules/@googleapis/googleapis -p `cd ..; go list -m -mod=mod -f {{.Dir}} github.com/grpc-ecosystem/grpc-gateway`/third_party/googleapis -p `cd ..; go list -m -mod=mod -f {{.Dir}} github.com/gogo/protobuf` -p node_modules/@protocolbuffers/protobuf/src
.PHONY: _gen.pbjs
_gen.pbjs:
	pbjs $(pbjs_flags) --no-comments --es6 -w es6 -t json-module   -o packages/api/index.pb.js ../api/bertybridge.proto ../api/bertyprotocol.proto ../api/bertymessenger.proto
	pbjs $(pbjs_flags) -t static-module ../api/bertybridge.proto ../api/bertyprotocol.proto ../api/bertymessenger.proto | pbts --no-comments -o packages/api/index.pb.d.ts -
	sed -E -i.bak 's/^.*constructor.*$$//g' packages/api/index.pb.d.ts
	rm -f packages/api/index.pb.d.ts.bak
	eslint --cache --quiet --fix --no-ignore packages/api/index.gen.js packages/codegen/index.gen.js

##### config

_gen.config:
	cd ../config; make generate

##### gen.sum

gensum_src := Makefile $(pbhbs_templates) ../api/bertyprotocol.proto ../api/bertymessenger.proto ../api/bertytypes.proto
gen.sum: $(gensum_src)
	$(call check-program, shasum)
	@shasum $(gensum_src) | sort > gen.sum.tmp
	@diff -q gen.sum.tmp gen.sum || $(MAKE) _gen.pbhbs _gen.pbjs _write_gen_sum _gen.config

.PHONY: _write_gen_sum
_write_gen_sum:
	  shasum $(gensum_src) | sort > gen.sum.tmp
	  mv gen.sum.tmp gen.sum;

#############################
# Internal/File-based rules #
#############################

#### iOS

packages/go-bridge/ios/Frameworks/Bertybridge.framework: $(bridge_src)
	cd .. && go mod download
	cd .. && go run golang.org/x/mobile/cmd/gomobile init
	@mkdir -p "packages/go-bridge/ios/Frameworks"
	cd .. && GO111MODULE=on go run golang.org/x/mobile/cmd/gomobile bind \
		-o js/$@ \
		-v $(ext_ldflags) \
		-target ios \
		-iosversion $(minimum_ios_ver) \
		./go/framework/bertybridge
	touch $@

packages/berty-app/ios/Berty.xcworkspace: $(pkg_desc) packages/berty-app/ios/Berty.xcodeproj packages/berty-app/ios/Podfile vendor/bundle
	cd packages/berty-app/ios && bundle exec pod install
	touch $@

packages/berty-app/ios/Berty.xcodeproj: vendor/xcodegen $(xcodegen_yml)
	mkdir -p packages/berty-app/ios/Berty
	touch packages/berty-app/ios/Berty/main.jsbundle

	IOS_BUNDLE_VERSION=$(shell echo -n $(shell git rev-list HEAD | wc -l)) \
	IOS_SHORT_BUNDLE_VERSION=$(shell echo "$(VERSION)" | cut -c2-) \
	IOS_COMMIT=$(shell git rev-parse HEAD) \
	swift run --package-path vendor/xcodegen xcodegen \
		--spec packages/berty-app/ios/berty.yaml \
		--cache-path vendor/xcodegen/.cache/berty-app \
		--use-cache

	touch $@

vendor/xcodegen: XcodeGen.version
	mkdir -p $@ $(TMP)/xcodegen_dl
	wget https://github.com/yonaskolb/XcodeGen/archive/$(xcodegen_ver).zip -O $(TMP)/xcodegen_dl/xcodegen.zip
	unzip $(TMP)/xcodegen_dl/xcodegen.zip -d $(TMP)/xcodegen_dl
	cp -rf $(TMP)/xcodegen_dl/*/* $@
	rm -rf $(TMP)/xcodegen_dl
	touch $@

vendor/bundle: Gemfile
	bundle install
	touch $@

packages/storybook-mobile/ios/Pods: vendor/bundle packages/storybook-mobile/ios/Podfile packages/storybook-mobile/node_modules
	cd packages/storybook-mobile/ios && bundle exec pod install

#### Android

packages/go-bridge/android/libs/gobridge.aar: $(bridge_src)
	cd .. && go mod download
	cd .. && go run golang.org/x/mobile/cmd/gomobile init
	rm -fr packages/go-bridge/android/build # remove broken cache
	@mkdir -p "packages/go-bridge/android/libs"
	cd .. && GO111MODULE=on go run golang.org/x/mobile/cmd/gomobile bind \
		-o js/$@ \
		-v $(ext_ldflags) \
		-target android \
		-androidapi $(minimum_android_ver) \
		./go/framework/bertybridge
	touch $@

packages/berty-app/android/app/debug.keystore:
	cp packages/berty-app/node_modules/react-native/template/android/app/debug.keystore $@

packages/storybook-mobile/android/app/debug.keystore:
	cp packages/berty-app/node_modules/react-native/template/android/app/debug.keystore $@

packages/berty-app/node_modules/react-native/react.gradle.orig: packages/berty-app/patch/react.gradle.patch
	@echo "patching file $(patsubst %.orig, %, $@)"
	@patch -f $(patsubst %.orig, %, $@) $< 1>/dev/null || true

#### React

$(pkg_mod): $(pkg_desc)
	$(call check-program, yarn)
	yarn $(if $(filter $(CI), true), --frozen-lockfile) --network-timeout 1200000 # Giving 20 minutes for packages resolution, the MacOS CI have a flaky internet.
	./node_modules/.bin/lerna --reject-cycles --concurrency=8 bootstrap
	# remove duplicate instance of $(react-native)
	rm -rf `find node_modules -type d -name react-native -path '*/node_modules/*'  | grep 'node_modules/react-native$$'`
	node_modules/.bin/jetifier
	mkdir -p $(pkg_mod)
	touch $(pkg_mod)
	touch node_modules/go.mod # avoid go to lookup in this directory

packages/storybook-mobile/storybook/storyLoader.gen.js: packages/storybook-mobile/node_modules
	PATH=$(PATH) rnstl \
		--pattern 'packages/storybook-mobile/../*-storybook/storybook.tsx' \
		--outputFile packages/storybook-mobile/storybook/storyLoader.gen.js
	sed -i.bak 's/\(.*\)\.\.\/node_modules\/\(.*\)\/storybook/\1\2\/storybook.tsx/g' packages/storybook-mobile/storybook/storyLoader.gen.js
	rm -f packages/storybook-mobile/storybook/storyLoader.gen.js.bak
