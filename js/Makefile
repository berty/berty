## User variables

VERSION ?= `$(GO) run -mod=readonly -modfile=$(PWD)/../go.mod github.com/mdomke/git-semver/v5`
VCS_REF ?= `git rev-parse --short HEAD`
BERTY_DAEMON_HOST ?= 127.0.0.1
BERTY_DAEMON_PORT ?= 1337
BERTY_DAEMON_OPTS ?= -p2p.webui-listener=""
BERTY_DAEMON_STORE ?= -store.dir=$(BERTY_DAEMON_PORT).db.d
METRO_RN_PORT ?= 8081
IOS_RN_FLAGS ?= --udid
IOS_DEVICE ?=
ANDROID_DEVICE ?=
GO ?= go # this allows to override the go version used
GO_TAGS ?= -tags "fts5 sqlite sqlite_unlock_notify"
GOMOBILE_IOS_TARGET ?= ios
GOMOBILE_ANDROID_TARGET ?= android
IOS_BUNDLE_VERSION ?= $(shell echo -n $(shell git rev-list HEAD | wc -l))
IOS_SHORT_BUNDLE_VERSION ?= $(shell echo "$(VERSION)" | cut -c2- | cut -f1 -d '-')
IOS_COMMIT ?= $(shell git rev-parse HEAD)
YOLO_SUFFIX ?= Yolo

E2E_TESTING_IOS_DEVICE ?= iPhone 11
E2E_TESTING_IOS_VERSION ?= 15.5
E2E_GET_IOS_APP ?= $(shell ls -ladt1 "$(HOME)/Library/Developer/Xcode/DerivedData/"*"/Build/Products/AppStore Release-iphonesimulator/Berty.app" | head -n 1)

## Internal variables

rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))
kill-program-using-port = $(foreach port,$(1),$(eval pid ?= $(shell lsof -t -i :$(port))) $(if $(pid),$(shell kill $(pid)),))
ext_ldflags = -ldflags="-X berty.tech/berty/v2/go/pkg/bertyversion.VcsRef=$(VCS_REF) -X berty.tech/berty/v2/go/pkg/bertyversion.Version=$(VERSION)"
bridge_src := $(call rwildcard,../go,*.go *.m *.h) ../go.sum
xcodegen_yml := $(wildcard $(PWD)/ios/*.yaml)
required_java_ver = 18
minimum_ios_ver = 12.0
minimum_android_ver = 21
ios_gomobile_cache="$(PWD)/ios/.gomobile-cache"
android_gomobile_cache="$(PWD)/android/.gomobile-cache"
xcodegen_cache="$(PWD)/ios/.xcodegen-cache"

## if (PWD != Makefile directory) then exit

makefile_dir = $(realpath $(dir $(realpath $(firstword $(MAKEFILE_LIST)))))
real_pwd = $(realpath $(PWD))
ifneq ($(real_pwd),$(makefile_dir))
	$(error make should be executed from '$(makefile_dir)' instead of '$(real_pwd)')
endif

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
	@echo "  daemon.start         Start Go Berty daemon                   BERTY_DAEMON_PORT=1337"
	@echo "  daemon.start.docker  Start Dockerized Go Berty daemon        BERTY_DAEMON_PORT=1337"
	@echo "  clean                Clear deps, cache and built objects"
	@echo "  generate             Use Protobuf to generate files"
	@echo "  ios.debug            Launch iOS app in debug mode            IOS_DEVICE=<virtual/real device>"
	@echo "  ios.release          Launch iOS app in release mode          IOS_DEVICE=<virtual/real device>"
	@echo "  lint                 Run eslint"
	@echo "  lint.fix             Run eslint and fix errors"
	@echo "  js.unused_exports    Run ts-unused-exports"
	@echo "  metro.start          Start React-Native Metro (app debug)"
	@echo "  web.debug            Start Craco (web app debug)"
	@echo "  web.daemon.start     Start Berty account daemon for web"
	@echo "  web.build            Build a production build for web"
	@echo "  regenerate           Clean and generate Protobuf files"
	@echo "  test                 Run tests"
	@echo "  e2e-tests.server     Run appium server"
	@echo "  e2e-tests.tests      Run appium e2e tests"

#### Test

e2e-tests/node_modules: e2e-tests/package.json
	cd e2e-tests &&	npm $(if $(filter $(CI), true), ci, install)
	touch $@

.PHONY: e2e-tests.server
e2e-tests.server: e2e-tests/node_modules
	cd e2e-tests && npx appium

.PHONY: e2e-tests.tests
e2e-tests.tests:
	IOS_DEVICE="$(E2E_TESTING_IOS_DEVICE)" \
	IOS_APP="$(if $(IOS_APP),$(IOS_APP),$(E2E_GET_IOS_APP))" \
	IOS_VERSION="$(E2E_TESTING_IOS_VERSION)" \
	node e2e-tests/basic.js

.PHONY: e2e-tests.ci-flow
e2e-tests.ci-flow: e2e-tests/node_modules
	$(call check-program, npx)
	npx concurrently --kill-others -n server,tests -s 'command-tests' 'make e2e-tests.server' 'sleep 30; make e2e-tests.tests'

.PHONY: test
test: node_modules
	$(call check-program, yarn)
	yarn test --coverage

#### Gen

.PHONY: generate
generate: node_modules gen.sum

.PHONY: regenerate
regenerate: gen.clean generate

#### Clean

.PHONY: clean
clean:
	$(call check-program, yarn)
	# React-Native cmd
	yarn cache clean -f
	$(call kill-program-using-port, $(METRO_RN_PORT))

	# Android cmd
	cd android && ./gradlew clean || true

	# iOS cmd
ifneq (, $(shell which xcodebuild))
	cd ios && xcodebuild clean || true
endif

	# React-Native files
	rm -rf .tmp
	rm -rf node_modules
	rm -rf /tmp/react-native-packager-cache-*
	rm -rf /tmp/metro-bundler-cache-*
	rm -rf .eslintcache

	# Web files
	rm -rf web/node_modules
	rm -rf web/build

	# Android files
	rm -rf android/.gradle
	rm -rf android/build
	rm -rf android/app/build
	rm -f android/libs/gobridge.aar

	# iOS files
	rm -rf ios/build
	rm -rf ios/Pods
	rm -rf ios/Frameworks/Bertybridge.xcframework
	rm -rf ios/Frameworks/Bertypush.xcframework
	rm -rf ios/vendor
	rm -rf ios/Berty.xcodeproj
	rm -rf ios/Berty.xcworkspace

	# gomobile cache
ifneq (, $(wildcard $(ios_gomobile_cache)))
	chmod -R u+wx $(ios_gomobile_cache) && rm -rf $(ios_gomobile_cache)
endif
ifneq (, $(wildcard $(android_gomobile_cache)))
	chmod -R u+wx $(android_gomobile_cache) && rm -rf $(android_gomobile_cache)
endif

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
	  packages/*/*.gen.ts \
	  packages/*/*.gen.js \
	  packages/*/*.pb.js \
	  packages/*/*.pb.d.ts \
	)
	@#TODO add more generated files here

#### Lint

.PHONY: lint
lint: node_modules
	$(call check-program, npx)
	cp .gitignore .eslintignore
	echo '*.pb.*' >> .eslintignore
	echo '*.gen.*' >> .eslintignore
	npx eslint --cache --quiet --ext=.js,.jsx,.ts,.tsx .
	npx tsc # check static typing
	../tool/check-dead-i18n/check.js
	$(MAKE) js.unused_exports

.PHONY: lint.fix
lint.fix: node_modules
	$(call check-program, npx)
	cp .gitignore .eslintignore
	echo '*.pb.*' >> .eslintignore
	echo '*.gen.*' >> .eslintignore
	npx eslint --cache --quiet --ext=.js,.jsx,.ts,.tsx --fix .
	npx tsc # check static typing

#### Look for js Unused exports

.PHONY: js.unused_exports
js.unused_exports: node_modules
	$(call check-program, npx)
	npx ts-unused-exports ./tsconfig.json --excludePathsFromReport="grpc-bridge;api;polyfill;packages/components/MiniGame.tsx;GoBridge.native.ts;PushTokenRequester.native.ts" --ignoreTestFiles --ignoreFiles='.*\.gen'

###################
# Build/Run rules #
###################

#### iOS

.PHONY: ios.app_deps
ios.app_deps: node_modules ios.gomobile ios.project

.PHONY: ios.debug
ios.debug: ios.app_deps
	$(call check-program, npx)
	npx react-native run-ios \
		--no-packager \
		--port="$(METRO_RN_PORT)" \
		--configuration='Debug' \
		--scheme='Berty Debug' \
		$(if $(IOS_DEVICE),$(IOS_RN_FLAGS)='$(IOS_DEVICE)',)

.PHONY: ios.release
ios.release: ios.app_deps
	$(call check-program, npx)
	npx react-native run-ios \
		--no-packager \
		--port="$(METRO_RN_PORT)" \
		--configuration='AppStore Release' \
		--scheme='Berty AppStore' \
		$(if $(IOS_DEVICE),$(IOS_RN_FLAGS)='$(IOS_DEVICE)',)

.PHONY: ios.log
ios.log:
	$(call check-program, npx)
	npx react-native log-ios

.PHONY: ios.project
ios.project: ios/Berty.xcworkspace

.PHONY: ios.gomobile
ios.gomobile: ios/Frameworks/Bertybridge.xcframework ios/Frameworks/Bertypush.xcframework

#### Android

.PHONY: android.app_deps
android.app_deps: node_modules android.gomobile

.PHONY: android.debug
android.debug: android.app_deps
	$(call check-program, npx)
	npx react-native run-android \
		--no-packager \
		--port="$(METRO_RN_PORT)" \
		--variant=Debug \
		--appIdSuffix=debug \
		$(if $(ANDROID_DEVICE),--deviceId='$(ANDROID_DEVICE)',)

.PHONY: android.release
android.release: android.app_deps
	$(call check-program, npx)
	npx react-native run-android \
		--no-packager \
		--port="$(METRO_RN_PORT)" \
		--variant=Release \
		$(if $(ANDROID_DEVICE),--deviceId='$(ANDROID_DEVICE)',)

.PHONY: android.gomobile
android.gomobile: android/libs/gobridge.aar

.PHONY: android.log
android.log:
	$(call check-program, npx)
	npx react-native log-android

.PHONY: android.emulator
android.emulator:
	$(call check-program, emulator)
	$(eval android_emulator = $(shell emulator -list-avds | head -n1))
	@if [ -z "$(android_emulator)" ]; then \
	  >&2 echo "ERROR: no Android emulator AVD found"; exit 1; \
	fi
	emulator @$(android_emulator) -logcat *:i -no-snapshot-save

.PHONY: android.reverse_tcp
android.reverse_tcp:
	$(call check-program, adb)
	$(if $(ANDROID_DEVICE),,$(eval ANDROID_DEVICE = $(shell adb devices | tail +2 | head -1 | cut -f 1)))
	@if [ -z "$(ANDROID_DEVICE)" ]; then \
	  >&2 echo "ERROR: no Android device found"; exit 1; \
	fi
	adb -s $(ANDROID_DEVICE) reverse tcp:$(BERTY_DAEMON_PORT) tcp:$(BERTY_DAEMON_PORT) # daemon
	adb -s $(ANDROID_DEVICE) reverse tcp:8081 tcp:8081 # metro

#### Web

.PHONY: web.debug
web.debug: web/node_modules
	$(call check-program, yarn)
	cd web && yarn && yarn start

.PHONY: web.daemon.start
web.daemon.start:
	cd ../go && $(MAKE) install
	berty account-daemon -node.account.listeners /ip4/127.0.0.1/tcp/9092/grpcws -node.listeners /ip4/127.0.0.1/tcp/9091/grpcws --log.filters='bty.grpc'

.PHONY: web.build
web.build: web/node_modules
	$(call check-program, yarn)
	cd web && yarn && yarn build

#### React

.PHONY: metro.start
metro.start: node_modules
	$(call check-program, npx)
	$(call kill-program-using-port, $(METRO_RN_PORT))
	npx react-native start --port=$(METRO_RN_PORT)

#### Go daemon

.PHONY: daemon.start
daemon.start:
	cd ../go && $(MAKE) install
	`$(GO) env GOPATH`/bin/berty $(BERTY_OPTS) daemon -node.listeners=/ip4/$(BERTY_DAEMON_HOST)/tcp/$(BERTY_DAEMON_PORT)/grpcws $(BERTY_DAEMON_STORE) $(BERTY_DAEMON_OPTS)

.PHONY: daemon.start.docker
daemon.start.docker:
	$(call check-program, docker)
	docker run -it --rm -p $(BERTY_DAEMON_PORT):$(BERTY_DAEMON_PORT) bertytech/berty $(BERTY_OPTS) daemon -node.listeners=/ip4/0.0.0.0/tcp/$(BERTY_DAEMON_PORT)/grpcws -p2p.webui-listener=""

#### Gen

##### pbjs

pbjs_common_flags := --force-long -p ../api -p node_modules/@googleapis/googleapis -p `$(GO) list -m -modfile=../go.mod -mod=mod -f {{.Dir}} github.com/grpc-ecosystem/grpc-gateway`/third_party/googleapis -p `$(GO) list -m -modfile=../go.mod -mod=mod -f {{.Dir}} github.com/gogo/protobuf` -p node_modules/@protocolbuffers/protobuf/src

pbjs_protos := ../api/accounttypes.proto ../api/bertybridge.proto ../api/protocoltypes.proto ../api/messengertypes.proto ../api/pushtypes.proto

packages/api/root.pb.js: $(wildcard ../api/*) node_modules
	$(call check-program, npx)
	npx pbjs $(pbjs_common_flags) \
		--no-comments \
		-t json-module \
		-w es6 \
		-o $@ \
		$(pbjs_protos)

packages/api/root.pb.d.ts: $(wildcard ../api/*) node_modules
	$(call check-program, npx)
	npx pbjs $(pbjs_common_flags) \
		-t static-module \
		$(pbjs_protos) \
		| npx pbts --no-comments -o $@ -
	sed -E -i.bak 's/^.*constructor.*$$//g' $@ # json-module codegen doesn't support new
	rm -f $@.bak

packages/grpc-bridge/welsh-clients.gen.ts: packages/grpc-bridge/gen-clients.js packages/api/root.pb.js node_modules
	$(call check-program, npx)
	npx babel-node packages/grpc-bridge/gen-clients.js > $@
	npx eslint --no-ignore --fix $@

packages/utils/api/types.gen.ts: packages/utils/api/gen-type-utils.js packages/api/root.pb.js node_modules
	$(call check-program, npx)
	npx babel-node packages/utils/api/gen-type-utils.js > $@
	npx eslint --no-ignore --fix $@

packages/hooks/methods/methods.gen.ts: packages/hooks/methods/gen-methods-hooks.js packages/api/root.pb.js node_modules
	$(call check-program, npx)
	npx babel-node packages/hooks/methods/gen-methods-hooks.js > $@
	npx eslint --no-ignore --fix $@

packages/redux/messengerActions.gen.ts: packages/redux/gen-messenger-actions.js packages/api/root.pb.js node_modules
	$(call check-program, npx)
	npx babel-node packages/redux/gen-messenger-actions.js > $@
	npx eslint --no-ignore --fix $@

packages/mock-services/mockedServicesInterfaces.gen.ts: packages/mock-services/gen-mocked-interfaces.js packages/api/root.pb.js node_modules
	$(call check-program, npx)
	npx babel-node packages/mock-services/gen-mocked-interfaces.js > $@
	npx eslint --no-ignore --fix $@


_gen.pbjs: packages/api/root.pb.js packages/api/root.pb.d.ts packages/grpc-bridge/welsh-clients.gen.ts packages/utils/api/types.gen.ts packages/redux/messengerActions.gen.ts packages/mock-services/mockedServicesInterfaces.gen.ts packages/hooks/methods/methods.gen.ts
.PHONY: _gen.pbjs

##### other generation

_gen.config:
	cd ../config; $(MAKE) generate

##### gen.sum

gensum_src := Makefile ../api/protocoltypes.proto ../api/messengertypes.proto ../api/accounttypes.proto
gen.sum: $(gensum_src)
	$(call check-program, shasum)
	@shasum $(gensum_src) | sort > gen.sum.tmp
	@diff -q gen.sum.tmp gen.sum || $(MAKE) _gen.pbjs _gen.config _write_gen_sum

.PHONY: _write_gen_sum
_write_gen_sum:
	$(call check-program, shasum)
	shasum $(gensum_src) | sort > gen.sum.tmp
	mv gen.sum.tmp gen.sum;

#############################
# Internal/File-based rules #
#############################

#### iOS

ios/Frameworks/Bertybridge.xcframework: $(bridge_src)
	cd .. && $(GO) mod download
	cd .. && $(GO) install golang.org/x/mobile/cmd/gobind
	cd .. && $(GO) run golang.org/x/mobile/cmd/gomobile init
	mkdir -p $(ios_gomobile_cache) ios/Frameworks

# use `nowatchdog` tags, see https://github.com/libp2p/go-libp2p-connmgr/issues/98
	cd .. && \
		PATH="$(PATH):`go env GOPATH`/bin" \
		CGO_CPPFLAGS=-DHAVE_GETHOSTUUID=0 \
		$(GO) run golang.org/x/mobile/cmd/gomobile bind \
			-o js/$@ \
			-v $(ext_ldflags) \
			$(GO_TAGS) -tags 'nowatchdog' \
			-cache $(ios_gomobile_cache)/bertybridge \
			-target $(GOMOBILE_IOS_TARGET) \
			-iosversion $(minimum_ios_ver) \
			./go/framework/bertybridge

	touch $@
	cd .. && $(GO) mod tidy

ios/Frameworks/Bertypush.xcframework: $(bridge_src)
	cd .. && $(GO) mod download
	cd .. && $(GO) install golang.org/x/mobile/cmd/gobind
	cd .. && $(GO) run golang.org/x/mobile/cmd/gomobile init
	mkdir -p $(ios_gomobile_cache) ios/Frameworks

# use `nowatchdog` tags, see https://github.com/libp2p/go-libp2p-connmgr/issues/98
	cd .. && \
		PATH="$(PATH):`go env GOPATH`/bin" \
		CGO_CPPFLAGS=-DHAVE_GETHOSTUUID=0 \
		$(GO) run golang.org/x/mobile/cmd/gomobile bind \
			-o js/$@ \
			-v $(ext_ldflags) \
			$(GO_TAGS) -tags 'nowatchdog' \
			-cache $(ios_gomobile_cache)/bertypush \
			-target $(GOMOBILE_IOS_TARGET) \
			-iosversion $(minimum_ios_ver) \
			./go/framework/bertypush

	touch $@
	cd .. && $(GO) mod tidy

ios/Berty.xcworkspace: ios/Berty.xcodeproj ios/Podfile ios/vendor/bundle node_modules
	$(call check-program, bundle)
	cd ios && bundle exec pod install --repo-update
	touch $@

ios/Berty.xcodeproj: $(xcodegen_yml) $(call rwildcard,ios/Berty/Source,*) $(call rwildcard,assets,*)
	$(call check-program, xcodegen)
	mkdir -p ios/Berty
	touch ios/Berty/main.jsbundle
	IOS_BUNDLE_VERSION=$(IOS_BUNDLE_VERSION) \
	IOS_SHORT_BUNDLE_VERSION=$(IOS_SHORT_BUNDLE_VERSION) \
	IOS_COMMIT=$(IOS_COMMIT) \
	YOLO_SUFFIX=$(YOLO_SUFFIX) \
	xcodegen \
		--spec ios/berty.yaml \
		--cache-path $(xcodegen_cache) \
		--use-cache
	touch $@

ios/vendor/bundle: ios/Gemfile
	$(call check-program, bundle)
	cd ios && bundle install
	touch $@

#### Android

android/libs/gobridge.aar: $(bridge_src)
	cd .. && $(GO) mod download
	cd .. && $(GO) run golang.org/x/mobile/cmd/gomobile init
	mkdir -p $(android_gomobile_cache) android/libs
	cd .. && GO111MODULE=on $(GO) run golang.org/x/mobile/cmd/gomobile bind \
		-o js/$@ \
		-v $(ext_ldflags) \
		$(GO_TAGS) \
		-cache $(android_gomobile_cache) \
		-target $(GOMOBILE_ANDROID_TARGET) \
		-androidapi $(minimum_android_ver) \
		./go/framework/bertybridge
	touch $@
	cd .. && $(GO) mod tidy

#### React

node_modules: package.json
	$(call check-program, yarn)
	yarn $(if $(filter $(CI), true), --frozen-lockfile --network-timeout 1200000 --network-concurrency 1)
	touch $@

web/node_modules: node_modules web/package.json
	$(call check-program, yarn)
	cd web && yarn $(if $(filter $(CI), true), --frozen-lockfile --network-timeout 1200000 --network-concurrency 1)
	touch $@

### Electron

.PHONY: electron.mac
electron.mac: web/node_modules
	cd ../go && $(MAKE) install
	rm -rf ./web/resources/mac/berty
	mkdir -p ./web/resources/mac/
	ln `$(GO) env GOPATH`/bin/berty ./web/resources/mac/berty
	cd ./web && yarn install
	cd ./web && yarn build
	cd ./web && yarn run dist:mac -- -c.buildVersion=$(shell echo -n $(shell git rev-list HEAD | wc -l)) -c.extraMetadata.version=$(VERSION)
