## user variables

GOPATH ?= $(HOME)/go
VERSION ?= `git describe --tags --always`
VCS_REF ?= `git rev-parse --short HEAD`
BUILD_DATE ?= `date +%s`
TMPDIR ?= /tmp
CI ?= false
BERTY_DAEMON_PORT ?= 1337
STORYBOOK_MOBILE_PORT ?= 7007
STORYBOOK_WEB_PORT ?= 7008
REACT_NATIVE_PORT ?= 8081
APP_CONFIG ?= development
APP_TARGET ?= debug
ANDROID_DEVICE ?=
IOS_DEVICE ?= iPhone 11

## Internal variables

rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))
export PATH := $(PWD)/node_modules/.bin:$(PATH)
author = Berty Technologies <oss@berty.tech>
license = (Apache-2.0 or MIT)
ext_ldflags = -ldflags="-X berty.tech/berty/go/pkg/bertymessenger.VcsRef=$(VCS_REF) -X berty.tech/berty/go/pkg/bertymessenger.Version=$(VERSION) -X berty.tech/berty/go/pkg/bertymessenger.BuildTime=$(BUILD_DATE)"
pkg := $(dir $(wildcard $(PWD)/packages/*/package.json))
pkg_mod := $(patsubst %, %/node_modules, $(pkg)) node_modules
pkg_desc := $(patsubst %, %/package.json, $(pkg)) package.json
bridge_src := $(call rwildcard,../vendor ../go, "*.go")
berty_bin := $(GOPATH)/bin/berty
react-native := $(abspath node_modules/.bin/react-native)
clisim := packages/berty-app/node_modules/.bin/clisim

## User commands

.PHONY: help
help:
	@echo "User commands          Description                             Main env options"
	@echo "  android.run"
	@echo "  android.storybook"
	@echo "  daemon.start                                                 BERTY_DAEMON_PORT=1337"
	@echo "  daemon.start.docker                                          BERTY_DAEMON_PORT=1337"
	@echo "  clean                clear cache"
	@echo "  deps.update"
	@echo "  generate             use protobuf to generate files"
	@echo "  ios.run                                                      IOS_DEVICE='iPhone 11'"
	@echo "  ios.storybook"
	@echo "  lint"
	@echo "  lint.fix"
	@echo "  lint.quick           lint without verifying deps"
	@echo "  metro.start"
	@echo "  regenerate"
	@echo "  test                 run tests"
	@echo "  test.quick           run tests without verifying deps"
	@echo "  web.storybook"

.PHONY: test
test: deps
	yarn test

.PHONY: test.quick
test.quick:
	yarn test

.PHONY: deps.update
deps.update: deps
	upd

.PHONY: generate
generate: deps gen.sum

.PHONY: clean
clean:
	rm -rf .tmp
	rm -rf $(pkg_mod)
	rm -rf packages/berty-app/android/.gradle
	rm -rf packages/berty-app/ios/build
	rm -rf $(TMPDIR)/react-native-packager-cache-*
	rm -rf $(TMPDIR)/metro-bundler-cache-*
	rm -rf packages/go-bridge/ios/Frameworks/Bertybridge.framework
	rm -rf Pods
	rm -f packages/go-bridge/android/libs/gobridge.aar
	rm -rf packages/storybook-mobile/ios/build
	rm -rf packages/berty-app/android/app/build

	yarn cache clean -f
ifneq (, $(shell which xcodebuild))
	cd packages/berty-app/ios && xcodebuild clean || true
	cd packages/storybook-mobile/ios && xcodebuild clean || true
endif
	cd packages/berty-app/android && ./gradlew clean || true

	touch packages/berty-app/ios/Podfile

	# FIXME: use PIDs instead of lsof-based detection
	lsof -t -i :$(REACT_NATIVE_PORT) | xargs --no-run-if-empty kill
	lsof -t -i :$(STORYBOOK_MOBILE_PORT) | xargs --no-run-if-empty kill
	lsof -t -i :$(STORYBOOK_WEB_PORT) | xargs --no-run-if-empty kill

	@echo "Cleaned. Now you may consider clearing some of your system cache with one of the following commands."
	@echo ""
	@echo "  rm -rf $$HOME/.gradle/caches"
	@echo "  rm -rf $(HOME)/Library/Developer/Xcode/DerivedData"
	@echo "  rm -rf ~/Library/Caches/CocoaPods"
	@echo "  rm -f $(berty_bin)"

.PHONY: regenerate
regenerate: gen.clean generate

.PHONY: gen.clean
gen.clean:
	rm -f gen.sum
	rm -f $(wildcard \
	  packages/*/*.gen.tsx \
	  packages/*/*.gen.js \
	  packages/*/*.pb.js \
	  packages/*/*.pb.d.ts \
	)
	rm -fr packages/store/protocol/grpc-web-gen
	@#TODO add more generated files here

.PHONY: deps
deps: $(pkg_mod)

.PHONY: lint
lint: deps
	cp .gitignore .eslintignore
	echo "packages/store/protocol/grpc-web-gen/" >> .eslintignore
	echo "*.pb.*" >> .eslintignore
	echo "*.gen.*" >> .eslintignore
	eslint --cache --quiet --ext=.js,.jsx,.ts,.tsx .

.PHONY: lint.fix
lint.fix: deps
	eslint --fix .

.PHONY: lint.quick
lint.quick:
	cp .gitignore .eslintignore
	echo "packages/store/protocol/grpc-web-gen/" >> .eslintignore
	echo "*.pb.*" >> .eslintignore
	echo "*.gen.*" >> .eslintignore
	eslint --cache --quiet --ext=.js,.jsx,.ts,.tsx .

print-%: ; @echo $* = $($*)

## advanced rules

### react-native

#### iOS

.PHONY: ios.run
ios.run: deps packages/go-bridge/ios/Frameworks/Bertybridge.framework packages/berty-app/ios/Pods/Manifest.lock
	[ -f ".env.$(APP_CONFIG)" ] && cp .env.$(APP_CONFIG) /tmp/envfile || cp .env /tmp/envfile
	cd packages/berty-app && $(react-native) run-ios --no-packager --configuration=$(if $(filter $(APP_CONFIG), development),Debug,Release) --scheme=$(APP_TARGET) --simulator='$(IOS_DEVICE)'

.PHONY: ios.release
ios.release: deps packages/go-bridge/ios/Frameworks/Bertybridge.framework packages/berty-app/ios/Pods/Manifest.lock
	cd packages/berty-app && bundle install
	../tool/build/shell/release-ios.sh

.PHONY: ios.log
ios.log:
	cd packages/berty-app && $(react-native) log-ios

.PHONY: ios.storybook
ios.storybook: deps packages/storybook-mobile/ios/Pods _storybook.mobile.start
	lsof -t -i :$(STORYBOOK_MOBILE_PORT) | xargs --no-run-if-empty kill
	lsof -t -i :$(REACT_NATIVE_PORT) | xargs --no-run-if-empty kill
	cd packages/storybook-mobile && start-storybook &
	cd packages/storybook-mobile && PWD=$(abspath packages/storybook-mobile) $(react-native) start --reset-cache &
	cd packages/storybook-mobile && $(react-native) run-ios --simulator='iPhone 11' --no-packager
	#cd packages/storybook-mobile && $(react-native) run-ios --no-packager

ios.gomobile: packages/go-bridge/ios/Frameworks/Bertybridge.framework

#### Android

.PHONY: android.run
android.run: deps packages/go-bridge/android/libs/gobridge.aar packages/berty-app/node_modules/react-native/react.gradle.orig $(HOME)/.android/debug.keystore
	$(call check-program, adb)
	$(eval ANDROID_DEVICE := `adb devices | tail +2 | head -1 | cut -f 1`)
	../tool/build/shell/check-java.sh 18
	adb -s $(ANDROID_DEVICE) reverse tcp:$(BERTY_DAEMON_PORT) tcp:$(BERTY_DAEMON_PORT)
	cd packages/berty-app && $(react-native) run-android --no-packager --variant=$(APP_TARGET) --deviceId="$(ANDROID_DEVICE)" $(if $(filter-out $(APP_TARGET), store), --appIdSuffix=$(APP_TARGET))

.PHONY: android.release
android.release: deps packages/go-bridge/android/libs/gobridge.aar packages/berty-app/node_modules/react-native/react.gradle.orig $(HOME)/.android/debug.keystore
	../tool/build/shell/release-android.sh

.PHONY: android.log
android.log:
	cd packages/berty-app && $(react-native) log-android

.PHONY: android.emulator
android.emulator:
	$(call check-program, adb emulator)
	$(clisim) -af &
	adb wait-for-device || trye

.PHONY: android.storybook
android.storybook: deps start.storybook.mobile packages/storybook-mobile/android/app/debug.keystore
	cd packages/storybook-mobile && clisim -af
	cd packages/storybook-mobile && $(react-native) run-android --no-packager

#### Web

.PHONY: web.storybook
web.storybook: deps
	lsof -t -i :$(STORYBOOK_WEB_PORT) | xargs --no-run-if-empty kill
	cd packages/storybook-web && echo Y | start-storybook --port=$(STORYBOOK_WEB_PORT) -c lib &

.PHONY: web-dev-app.start
web-dev-app.start:
	cd packages/web-dev-app && yarn && yarn start

#### Tools

.PHONY: metro.start
metro.start: deps
	$(call check-program, lsof)
	$(eval pid := $(shell lsof -t -i :$(REACT_NATIVE_PORT) -s TCP:LISTEN))
	@if [ -n "$(pid)" ]; then \
		echo Metro pid: $(pid); \
		kill -9 $(pid) || true; \
		echo "Waiting for metro to die.. (`date`)"; \
		while ps -p $(pid); do sleep 1; done; \
		echo "Metro dead (`date`)"; \
	fi
	cd packages/berty-app && $(react-native) start --reset-cache --port=$(REACT_NATIVE_PORT) --host=127.0.0.1

.PHONY: daemon.start
daemon.start:
	cd ../go && $(MAKE) install
	$(GOPATH)/bin/berty daemon -l /ip4/127.0.0.1/tcp/$(BERTY_DAEMON_PORT)/grpcws

.PHONY: bridge.start.docker
bridge.start.docker:
	$(call check-program, docker)
	docker run -it --rm -p $(BERTY_DAEMON_PORT):$(BERTY_DAEMON_PORT) bertytech/berty daemon -l /ip4/0.0.0.0/tcp/$(BERTY_DAEMON_PORT)/grpcws

### gen

#### pbhbs based code generation

pbhbs_templates := $(wildcard */*/protocol/*.hbs */*/messenger/*.hbs */*/types/*.hbs */components/*.hbs)
pbhbs_targets := $(patsubst %.hbs,%,$(pbhbs_templates))
pbhbs_flags := -p ../api -p node_modules/@googleapis/googleapis -p ../vendor -p node_modules/@protocolbuffers/protobuf/src -H packages/codegen/helpers
.PHONY: _gen.pbhbs
_gen.pbhbs:
	pbhbs $(pbhbs_flags) -t packages/store/protocol  -o packages/store/protocol  ../api/bertyprotocol.proto
	pbhbs $(pbhbs_flags) -t packages/store/messenger -o packages/store/messenger ../api/bertymessenger.proto
	pbhbs $(pbhbs_flags) -t packages/store/types     -o packages/store/types     ../api/bertytypes.proto
	pbhbs $(pbhbs_flags) -t packages/components      -o packages/components      ../api/bertyprotocol.proto  ../api/bertymessenger.proto ../api/bertytypes.proto
	pbhbs $(pbhbs_flags) -t packages/api             -o packages/api             ../api/bertyprotocol.proto  ../api/bertymessenger.proto ../api/bertytypes.proto
	pbhbs $(pbhbs_flags) -t packages/codegen         -o packages/codegen         ../api/bertyprotocol.proto  ../api/bertymessenger.proto ../api/bertytypes.proto
	eslint --cache --quiet --fix --no-ignore $(pbhbs_targets)

#### pbjs

pbjs_flags := -p node_modules/@googleapis/googleapis -p ../vendor -p node_modules/@protocolbuffers/protobuf/src
.PHONY: _gen.pbjs
_gen.pbjs:
	pbjs $(pbjs_flags) --no-comments --es6 -w es6 -t json-module   -o packages/api/index.pb.js \
		../api/bertybridge.proto \
		../api/bertyprotocol.proto \
		../api/bertymessenger.proto

	pbjs $(pbjs_flags) -t static-module \
		../api/bertybridge.proto \
		../api/bertyprotocol.proto \
		../api/bertymessenger.proto \
			| pbts --no-comments -o packages/api/index.pb.d.ts -

	sed -E -i.bak 's/^.*constructor.*$$//g' packages/api/index.pb.d.ts
	rm -f packages/api/index.pb.d.ts.bak
	eslint --cache --quiet --fix --no-ignore packages/api/index.gen.js packages/codegen/index.gen.js

#### protoc

protoc_src := ../api/bertytypes.proto ../api/bertyprotocol.proto ../api/bertymessenger.proto ../vendor/github.com/gogo/protobuf/gogoproto/gogo.proto
protoc_target_dir := ../js/packages/store/protocol/grpc-web-gen
protoc_opts := -I ../api:../vendor:/protobuf
.PHONY: _gen.protoc
_gen.protoc: ../vendor
	docker run --rm --user="`id -u`" --entrypoint="sh" \
	  --volume="$(PWD)/..:/go/src/berty.tech/berty" --workdir="/go/src/berty.tech/berty/js" \
	  bertytech/protoc:25 -xec 'make _gen.protoc.local'
.PHONY: _gen.protoc.local
_gen.protoc.local:
	$(call check-program, protoc)
	rm -fr $(protoc_target_dir)
	mkdir -p $(protoc_target_dir)
	protoc $(protoc_opts) --plugin=protoc-gen-ts=$(PWD)/node_modules/.bin/protoc-gen-ts --js_out=import_style=commonjs,binary:$(protoc_target_dir) --ts_out=service=grpc-web:$(protoc_target_dir) $(protoc_src)

#### gen.sum

gensum_src := $(protoc_src) Makefile $(pbhbs_templates)
gen.sum: $(gensum_src)
	$(call check-program, shasum)
	@shasum $(gensum_src) | sort > gen.sum.tmp
	@diff -q gen.sum.tmp gen.sum || $(MAKE) _gen.protoc _gen.pbhbs _gen.pbjs _write_gen_sum
.PHONY: _write_gen_sum
_write_gen_sum:
	  shasum $(gensum_src) | sort > gen.sum.tmp
	  mv gen.sum.tmp gen.sum;

## Other

.PHONY: tidy
tidy:
	go mod tidy
	cd packages/go-bridge && go mod tidy

## file-based rules

../vendor: ../go.mod ../go.sum
	cd .. && GO111MODULE=on go mod vendor

../vendor/github.com/gogo/protobuf/gogoproto/gogo.proto: ../vendor

$(pkg_mod): $(pkg_desc)
	$(call check-program, yarn)
	yarn $(if $(filter $(CI), true), --frozen-lockfile)
	./node_modules/.bin/lerna --reject-cycles --concurrency=8 bootstrap
	# remove duplicate instance of $(react-native)
	rm -rf `find node_modules -type d -name react-native -path '*/node_modules/*'  | grep 'node_modules/react-native$$'`
	# convert android deps to androidx
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

packages/storybook-mobile/ios/Pods: packages/storybook-mobile/ios/Podfile packages/storybook-mobile/node_modules
	cd packages/storybook-mobile/ios && pod install

packages/storybook-mobile/android/app/debug.keystore: $(HOME)/.android/debug.keystore
	cat $< > $@

$(HOME)/.android/debug.keystore:
	mkdir -p $(dir $@)
	cp packages/berty-app/node_modules/react-native/template/android/app/debug.keystore $@

packages/berty-app/node_modules/react-native/react.gradle.orig: packages/berty-app/patch/react.gradle.patch
	@echo "patching file $(patsubst %.orig, %, $@)"
	@patch -f $(patsubst %.orig, %, $@) $< 1>/dev/null || true

packages/berty-app/ios/Pods/Manifest.lock: packages/berty-app/ios/Podfile packages/berty-app/package.json
	([ ! -z "$(shell which pod)" ] \
		&& [[ "$$(pod --version)" > "1.7." ]]) \
		|| sudo gem install cocoapods
	cd packages/berty-app/ios && pod install

packages/berty-app/ios/Podfile:
	touch $@

packages/go-bridge/ios/Frameworks/Bertybridge.framework: $(bridge_src) ../vendor
	cd packages/go-bridge && go install golang.org/x/mobile/cmd/gomobile
	cd packages/go-bridge && gomobile init
	@mkdir -p "packages/go-bridge/ios/Frameworks"
	GO111MODULE=off gomobile bind -o $@ -v $(ext_ldflags) -target ios berty.tech/berty/go/framework/bertybridge
	touch "packages/go-bridge/ios/Frameworks"

packages/go-bridge/android/libs/gobridge.aar: $(bridge_src) ../vendor
	cd packages/go-bridge && go install golang.org/x/mobile/cmd/gomobile
	cd packages/go-bridge && gomobile init
	@mkdir -p "packages/go-bridge/android/libs"
	GO111MODULE=off gomobile bind -o $@ -v $(ext_ldflags) -target android berty.tech/berty/go/framework/bertybridge
