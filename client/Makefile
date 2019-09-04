export PWD ?= $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

### SETUP

.DEFAULT_GOAL := all
rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

LERNA ?= node_modules/.bin/lerna
LERNA_PRE ?= package.json lerna.json
LERNA_RUN := $(LERNA) --reject-cycles exec
LERNA_UPDATE := node_modules/.bin/lernaupdate

LERNA_PACKAGES := \
	$(PWD)/package.json \
	$(shell find packages -type f -name 'package.json' -not -path '*/node_modules/*')
LERNA_MODS := $(PWD)/node_modules/.bootstraped

PROTOS = $(strip $(call rwildcard, ../core, *.proto))
OUR_PROTOS = $(filter-out $(call rwildcard,../core/vendor/, *.proto),$(PROTOS))
TEMPLATES := $(shell find packages -type f -name '*.hbs' -not -path '*/node_modules/*')
TEMPLATES_GENERATE := $(patsubst packages/template/%.hbs,packages/%,$(TEMPLATES))
GENERATE := $(patsubst packages/template/%.hbs,packages/%,$(TEMPLATES)) \
	$(patsubst ../core/%.proto,packages/bridge/service/%.pb.json,$(OUR_PROTOS))
RN := react-native

platform ?= web
package ?= app

.PHONY: .FORCE
.FORCE:

.PHONY: all
all: deps.lerna

.PHONY: help
help:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

### LERNA

.PHONY: deps.lerna
deps.lerna: $(LERNA_MODS)

$(LERNA_MODS): $(LERNA_PACKAGES) $(LERNA)
	$(LERNA) --reject-cycles bootstrap --hoist $(shell [ ! -z "$$CIRCLE_JOB" ] && echo "--ci --concurrency=2")
	$(PWD)/node_modules/.bin/link-module-alias
	$(PWD)/node_modules/.bin/napa
	touch $@

$(LERNA):
	npm $(shell [ -z "$$CIRCLE_JOB" ] && echo "install" || echo "ci") lerna

.IGNORE .PHONY: clean.lerna
clean.lerna:
	$(LERNA) clean -y && rm -rf $(LERNA_MODS)

.IGNORE .PHONY: fclean.lerna
fclean.lerna:
	$(LERNA) clean -y && rm -rf $(LERNA_MODS) && rm -rf node_modules

### COMMANDS
.PHONY: update
version.lerna: $(ROOT)
	$(LERNA) version \
		--conventional-commmits \
		--no-push \
		--no-git-tag-version \
		--sign-git-commit \
		--sign-git-tag \

.PHONY: dedup
dedup.lerna: $(ROOT)
	$(LERNA_UPDATE) -d

.PHONY: update.lerna
update.lerna:
	$(LERNA_UPDATE)

.PHONY: pretty
pretty: $(LERNA_PACKAGES)
	npm run prettify -- $$(find packages -type f -name '*.js' -not -path '*/node_modules/*')


.PHONY: pretty.gen
pretty.gen: $(LERNA_PACKAGES)
	npm run prettify -- $$(find packages -type f -name '*.gen.js' -not -path '*/node_modules/*')

### GENERATE

.PHONY: generate
generate: deps.lerna $(GENERATE)

packages/bridge/service/%.pb.json: ../core/%.proto
	mkdir -p "$(dir packages/bridge/service/$@)"
	$(PWD)/node_modules/.bin/pbjs \
		--path node_modules/@google/protobuf/src \
		--path node_modules/berty-core/vendor/berty.tech \
		--path node_modules/berty-core/vendor/github.com/gogo/protobuf \
		--path node_modules/berty-core/vendor \
		--path node_modules/berty-core/ \
		-t json \
		$< > $@

packages/%: packages/template/%.hbs $(OUR_PROTOS)
	$(PWD)/node_modules/.bin/pbhbs \
		--template-dir packages/template \
		--proto-path node_modules/@google/protobuf/src \
		--proto-path node_modules/berty-core/vendor/berty.tech \
		--proto-path node_modules/berty-core/vendor/github.com/gogo/protobuf \
		--proto-path node_modules/berty-core/vendor \
		--proto-path node_modules/berty-core \
		--output-dir packages \
		--helper-dir packages/template/helper \
		$(PWD)/node_modules/berty-core/api/node/service.proto
	npm run prettify -- $(TEMPLATES_GENERATE)

.IGNORE \
.PHONY: clean.generate
clean.generate:
	rm -rf $(GENERATE)

### BUNDLER

export REACT_APP_ENTRYPOINT ?= ./packages/$(package)

# Deps / build related
IOS := $(PWD)/ios
ANDROID := $(PWD)/android
OSX := $(PWD)/osx


# Fastlane build related

NAME ?= Berty
BUILD ?= .build

# ios related env
IOS_UDID := ''
IOS_VERSION ?= $(shell git describe --tags --always  | cut -d - -f 1,2 | tr - .| tail -c +2)
IOS_BUILD := $(BUILD)/ios
IOS_CUSTOM_NAME ?=

# @TODO: find a better way to pass those arguments >

# fastlane match
MATCH_COMPANY_TEAM_ID=WMBQ84HN4T
MATCH_ENTERPRISE_TEAM_ID=GR5463T564
PEM_COMPANY_TEAM_ID=WMBQ84HN4T
PEM_ENTERPRISE_TEAM_ID=GR5463T564

MATCH_PROVISIONING_PROFILE_ADHOC ?= 'match AdHoc chat.berty.ios.staff'
MATCH_PROVISIONING_PROFILE_DEBUG ?= 'match Development chat.berty.ios.debug'
MATCH_PROVISIONING_PROFILE_HOUSE ?= 'match InHouse chat.berty.ios.yolo'
MATCH_PROVISIONING_PROFILE_RELEASE ?= 'match AppStore chat.berty.ios'

# ios bundle ID

IOS_BUNDLE_ID_ADHOC ?= chat.berty.ios.staff
IOS_BUNDLE_ID_DEBUG ?= chat.berty.ios.debug
IOS_BUNDLE_ID_HOUSE ?= chat.berty.ios.yolo
IOS_BUNDLE_ID_RELEASE ?= chat.berty.ios

# android related env
ANDROID_VERSION ?= $(shell git rev-list --all --count)
ANDROID_BUILD ?= $(BUILD)/android
ANDROID_CUSTOM_NAME ?=

KEYCHAIN_NAME ?= berty_keychain
KEYCHAIN_PASSWORD ?= berty_pass

# Dockerised webapp related
SCALE ?= 1
PORT ?= 0
SERV ?=

# Options
package ?= app

ENV_FILE ?= $(PWD)/.environment


### CONFIG

.PHONY: config
config: /tmp/envfile $(PWD)/ios/tmp.xcconfig

.PHONY: config.debug
config.debug: config

.PHONY: config.staff config.adhoc
config.adhoc config.staff: config

.PHONY: config.yolo config.house
config.house config.yolo: config

.PHONY: config.release
config.release: config

/tmp/envfile: $(ENV_FILE) .FORCE
	echo $(ENV_FILE) > /tmp/envfile

$(ENV_FILE):
	@echo 'Error: You need to configure ' $@
	@false

.PHONY: deps.web
deps.web: $(PWD)/web/node_modules

$(PWD)/web/node_modules: $(PWD)/web/package.json deps.lerna
	cd $(PWD)/web && npm install

.PHONY: deps.logs
deps.logs:
	brew install --HEAD pidcat
##############################

### Build release/debug part ###
.PHONY: debug.react-native
debug.react-native:
	$(RN) start --reset-cache &

.PHONY: deps.android
deps.android: deps.lerna $(PWD)/android/app/google-services.json $(PWD)/.environment patch.android
	$(PWD)/node_modules/.bin/react-native link --platforms=android
	./node_modules/.bin/jetify
	cd ../core/platform/mobile && make build.android

$(PWD)/android/app/google-services.json:
	@echo 'Error: You need to configure ' $@
	@false

.PHONY: patch.android
patch.android: deps.lerna
	@if [ -z "$$(sed -n 4p node_modules/react-native-network-info/android/build.gradle | grep 'url \"https://maven.google.com\"')" ]; then \
		mv node_modules/react-native-network-info/android/build.gradle node_modules/react-native-network-info/android/build.gradle_topatch; \
		patch node_modules/react-native-network-info/android/build.gradle_topatch -i patch/gradle.patch -o node_modules/react-native-network-info/android/build.gradle; \
	fi

ANDROID_VARIANT ?= release
.PHONY: build.android
build.android: deps.android config.$(ANDROID_VARIANT)
	$(RN) run-android --variant=$(ANDROID_VARIANT) --no-packager

.PHONY: debug.android
debug.android: ANDROID_VARIANT := debug
debug.android: config.debug debug.react-native build.android

.PHONY: release.android
release.android: ANDROID_VARIANT := release
release.android: build.android

.PHONY: staff.android
staff.android: ANDROID_VARIANT := staff
staff.android: build.android

.PHONY: yolo.android
yolo.android: ANDROID_VARIANT := yolo
yolo.android: build.android

.PHONY: deps.osx
deps.osx: osx/node_modules/.updated

osx/node_modules/.updated: osx/package.json
	cd osx && npm install
	touch $@

.PHONY: release.osx
release.osx: deps.osx build.web
	cd ../core/platform/desktop && make build sign
	rm -rf osx/Berty.app
	cp -r ../core/platform/desktop/output/darwin-amd64/Berty.app osx/Berty.app
	cd osx && npm run build

.PHONY .IGNORE: clean.osx
fclean.osx:
	rm -rf osx/node_modules
	rm -rf osx/Berty.app

$(PWD)/ios/tmp.xcconfig: /tmp/envfile deps.lerna
	$(PWD)/node_modules/react-native-config/ios/ReactNativeConfig/BuildXCConfig.rb "$(PWD)" "$(PWD)/ios/tmp.xcconfig"

.PHONY: get_iphone_udid
get_iphone_udid:
	$(eval IOS_UDID = $(shell ios-deploy -c | grep 'Found' | head -n 1 | cut -d ' ' -f 3))
	@if [ -z '$(IOS_UDID)' ]; then						\
		echo 'No iOS device connected';					\
	else												\
		echo 'iOS device found with UDID: $(IOS_UDID)';	\
	fi
	$(eval IOS_UDID = $(shell if [ -n '$(IOS_UDID)' ]; then echo '--udid=$(IOS_UDID)'; fi))

.PHONY: deps.ios
deps.ios: $(PWD)/.environment $(PWD)/ios/core.framework $(PWD)/ios/Pods/Manifest.lock /tmp/envfile | deps.lerna
	if [ ! -e ./node_modules/react-native/third-party/glog-0.*/Makefile ]; then	\
		cd ./node_modules/react-native											\
			&& rm -rf third-party														\
			&& ./scripts/ios-install-third-party.sh										\
			&& cd third-party/glog-0.*													\
			&& ../../scripts/ios-configure-glog.sh;						\
	fi

$(PWD)/ios/Pods/Manifest.lock: $(PWD)/ios/Podfile | deps.lerna
	$(PWD)/node_modules/.bin/react-native link --platforms=ios
	([ ! -z "$(shell which pod)" ] && [[ "$$(pod --version)" > "1.7." ]]) || sudo gem install cocoapods
	cd ios && pod install --verbose

.PHONY: $(PWD)/ios/core.framework
$(PWD)/ios/core.framework:
	cd ../core/platform/mobile && make build.ios

IOS_CONFIGURATION ?= Release
IOS_SCHEME ?= release
.PHONY: build.ios
build.ios: deps.ios get_iphone_udid config.$(IOS_SCHEME)
	$(RN) run-ios \
		--no-packager \
		--configuration=$(IOS_CONFIGURATION) \
		--scheme=$(IOS_SCHEME) \
		$(IOS_UDID)

.PHONY: debug.ios
debug.ios: IOS_SCHEME := debug
debug.ios: IOS_CONFIGURATION ?= Debug
debug.ios: debug.react-native build.ios

.PHONY: test.debug.ios
test.debug.ios: RN = cavy
test.debug.ios: export REACT_APP_ENVIRONMENT = integration_test
test.debug.ios: debug.ios

.PHONY: release.ios
release.ios: IOS_SCHEME := release
release.ios: IOS_CONFIGURATION ?= Release
release.ios: build.ios

.PHONY: test.release.ios
test.release.ios: RN = cavy
test.release.ios: export REACT_APP_ENVIRONMENT = integration_test
test.release.ios: release.ios

.PHONY: adhoc.ios
adhoc.ios: IOS_SCHEME := adhoc
adhoc.ios: IOS_CONFIGURATION ?= adhoc
adhoc.ios: build.ios

.PHONY: test.adhoc.ios
test.adhoc.ios: RN = cavy
test.adhoc.ios: export REACT_APP_ENVIRONMENT = integration_test
test.adhoc.ios: adhoc.ios

.PHONY: house.ios
house.ios: IOS_SCHEME := house
house.ios: IOS_CONFIGURATION ?= house
house.ios: build.ios

.PHONY: test.house.ios
test.house.ios: RN = cavy
test.house.ios: export REACT_APP_ENVIRONMENT = integration_test
test.house.ios: house.ios

.PHONY: debug.web
debug.web: deps.web
	cd web && npm run start

.PHONY: build.web
build.web: $(PWD)/web/build

$(PWD)/web/build: deps.web
	cd $(PWD)/web && npm run build

export COMPOSE_PROJECT_NAME ?= integration_test
COMPOSE_TEST_WEB := docker-compose -f ../build/docker/integration-tests/docker-compose.yml
.PHONY: test.web
test.web: deps.web build.web deps.test.web
	$(COMPOSE_TEST_WEB) up --build cavy-report

.PHONY: deps.test.web
deps.test.web: clean.test.web
	docker network create $(COMPOSE_PROJECT_NAME)_default || true
	$(COMPOSE_TEST_WEB) up --build $(shell [ -z "$(CIRCLE_JOB)" ] || echo "-d") berty-core client || true

.PHONY .IGNORE: clean.test.web
clean.test.web:
	$(COMPOSE_TEST_WEB) kill berty-core client || true
	$(COMPOSE_TEST_WEB) rm -f berty-core client || true

.PHONY: deps.dashboard
deps.dashboard: deps.lerna

.PHONY: debug.dashboard
debug.dashboard: deps.dashboard
	cd packages/dashboard && npm run start

.PHONY: build.dashboard
build.dashboard: deps.dashboard
	cd packages/dashboard && npm run build
##############################

### Logs part ###
.PHONY: log.android
log.android:
	@(command -v pidcat > /dev/null && pidcat --always-display-tags -t chat.berty.*) || \
	(echo "Consider to install pidcat (brew install pidcat) for a better logging experience" && sleep 2 && adb logcat)

.PHONY: log.ios
log.ios:
	@open '/Applications/Utilities/Console.app'

##############################


### Clean dependencies part ###
.PHONY .IGNORE: clean.bundler_and_pkgs
clean.bundler_and_pkgs:
	watchman watch-del-all

.PHONY .IGNORE: clean.android
clean.android:
	cd $(ANDROID) \
		&& ./gradlew clean \
		&& ./gradlew cleanBuildCache

.PHONY .IGNORE: clean.ios
clean.ios:
	cd $(IOS); rm -rf build; xcodebuild clean; rm -rf $(HOME)/Library/Developer/Xcode/DerivedData; rm -rf Pods; rm -rf ~/Library/Caches/CocoaPods

.PHONY .IGNORE: clean.web
clean.web:
	rm -rf web/*/cache web/*/dist web/node_modules

.PHONY .IGNORE: fclean.android
fclean.android: clean.android clean.bundler_and_pkgs
	cd $(ANDROID) && rm -rf app/build ble/build

.PHONY .IGNORE: fclean.ios
fclean.ios: clean.ios clean.bundler_and_pkgs
	rm -rf ios/Pods

.PHONY .IGNORE: fclean.web
fclean.web: clean.web clean.bundler_and_pkgs
	rm -rf web/build

.PHONY .IGNORE: fclean
fclean: fclean.android fclean.ios fclean.osx fclean.web clean.bundler_and_pkgs fclean.lerna

.PHONY: re.android
re.android: fclean.android debug.android

.PHONY: re.ios
re.ios: fclean.ios debug.ios

.PHONY: re.web
re.web: fclean.web debug.web
##############################

### Dockerized webapp part ###
COMPOSE ?= docker-compose

webapp.generate:
	cd ../../core && make generate

.dockerbuild: Dockerfile
	@$(COMPOSE) build --pull --parallel
	touch .dockerbuild

webapp.build: .dockerbuild

webapp.start: webapp.generate webapp.build
	@$(COMPOSE) up -d --scale core-service=$(SCALE)

webapp.stop:
	@$(COMPOSE) kill

webapp.list:
	@docker ps -f name=react-native_core-service --format "{{.Names}}\tid: {{.ID}}\tport: {{.Ports}}" | sort \
		| sed 's/\(0\.\)\{3\}0:1\([0-9]\)\{3\}->1\([0-9]\)\{3\}\/tcp\, \(0\.\)\{3\}0://g' | sed 's/->.*$$//g'

webapp.logs:
	@$(COMPOSE) logs --tail=100 -f $(SERV)

webapp.open:
	@GQL_PORTS=`docker ps -f name=react-native_core-service --format "{{.Ports}}" |			\
				awk 'match($$0,/:8[0-]{3}->/) {print substr($$0,RSTART+1,RLENGTH-3)}'`;	\
	COUNT=$$(echo "$$GQL_PORTS" | sed '/^\s*$$/d' | wc -l | tr -d ' ');						\
	if [[ $$(docker ps -f name=react-native_tracer-service -q) ]]; then						\
		COUNT=$$((COUNT+1));																\
		open "http://localhost:16686";														\
	fi;																						\
	echo "Openning $$COUNT webapp tabs in browser...";										\
	for PORT in $$GQL_PORTS; do open "http://localhost:3001?gql-port=$$PORT"; done

webapp.gendata:
	@if [ $(PORT) -eq 0 ]; then																				\
		CONT_ID=`docker ps -f name=react-native_core-service --format "{{.ID}}"`;							\
	else																									\
		CONT_ID=`docker ps --format "{{.ID}}#{{.Ports}}" | grep "0.0.0.0:$(PORT)->8700" | cut -d'#' -f1`;	\
	fi;																										\
	COUNT=$$(echo "$$CONT_ID" | sed '/^\s*$$/d' | wc -l | tr -d ' ');										\
	echo "Generating fake data inside $$COUNT containers...";												\
	for ID in $$CONT_ID; do docker exec -t $$ID berty client berty.node.GenerateFakeData; done

webapp.reset:
	@if [ $(PORT) -eq 0 ]; then																				\
		CONT_ID=`docker ps -f name=react-native_core-service --format "{{.ID}}"`;							\
	else																									\
		CONT_ID=`docker ps --format "{{.ID}}#{{.Ports}}" | grep "0.0.0.0:$(PORT)->8700" | cut -d'#' -f1`;	\
	fi;																										\
	for ID in $$CONT_ID; do																					\
		echo "Reset not implemented yet $$ID";																\
	done

webapp.rebuild: webapp.rm
	@rm -f .dockerbuild
	@$(COMPOSE) build --pull

webapp.rm: webapp.stop
	@CONT_ID=`echo $$(docker ps -a -f name=react-native_core-service -q)		\
					$$(docker ps -a -f name=react-native_tracer-service -q)		\
					$$(docker ps -a -f name=react-native_web-service -q)`;		\
	COUNT=$$(echo "$$CONT_ID" | sed '/^\s*$$/d' | wc -w | tr -d ' ');			\
	echo "Deleting $$COUNT previously generated containers...";					\
	if [ $$COUNT -ne 0 ]; then docker rm $$CONT_ID; fi
##############################


### Fastlane build part ###

.PHONY: deps.fastlane
deps.fastlane: deps.fastlane $(PWD)/Gemfile

$(PWD)/Gemfile: $(PWD)/Gemfile.lock
	bundle install

.PHONY: appname.ios
appname.ios:
	@[[ ! -z "$(IOS_CUSTOM_NAME)" ]] \
		&& plutil -replace CFBundleDisplayName -string "$(IOS_CUSTOM_NAME)" $(IOS)/Berty/Info.plist \
		&& echo "Setting custom name: [$(IOS_CUSTOM_NAME)] for ios" || true

.PHONY: version
version:
	mkdir -p $(BUILD)
	echo "ios:$(IOS_VERSION)\nandroid:$(ANDROID_VERSION)\n" > $(BUILD)/version

.PHONY: version.android
version.android: version
	bundle exec fastlane run increment_version_code version_code:$(ANDROID_VERSION) gradle_file_path:$(ANDROID)/app/build.gradle

.PHONY: version.ios
version.ios: version
	plutil -replace CFBundleShortVersionString -string $(IOS_VERSION) $(IOS)/Berty/Info.plist

.PHONY: fastlane.match.development
fastlane.match.development: deps.fastlane deps.ios config.debug
	time bundle exec fastlane run match type:development app_identifier:$(IOS_BUNDLE_ID_DEBUG) team_id:$(MATCH_COMPANY_TEAM_ID)

.PHONY: fastlane.match.appstore
fastlane.match.appstore: deps.fastlane deps.ios config.release
	time bundle exec fastlane run match type:appstore app_identifier:$(IOS_BUNDLE_ID_RELEASE) team_id:$(MATCH_COMPANY_TEAM_ID)

.PHONY: fastlane.match.adhoc
fastlane.match.adhoc: deps.fastlane deps.ios config.staff
	time bundle exec fastlane run match force_for_new_devices:true type:adhoc app_identifier:$(IOS_BUNDLE_ID_ADHOC) team_id:$(MATCH_COMPANY_TEAM_ID)

.PHONY: fastlane.match.enterprise
fastlane.match.enterprise: deps.fastlane deps.ios config.yolo
	time bundle exec fastlane run match type:enterprise app_identifier:$(IOS_BUNDLE_ID_HOUSE) team_id:$(MATCH_ENTERPRISE_TEAM_ID)

.PHONY: fastlane.match.all
fastlane.match.all: deps.fastlane fastlane.match.development fastlane.match.appstore fastlane.match.adhoc fastlane.match.enterprise

.PHONY: fastlane.pem.development
fastlane.pem.development: deps.fastlane deps.ios config.debug
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_DEBUG) team_id:$(PEM_COMPANY_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_DEBUG)-voip.pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_DEBUG) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_DEBUG)-dev.pem --development

.PHONY: fastlane.pem.appstore
fastlane.pem.appstore: deps.fastlane deps.ios config.release
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_RELEASE) team_id:$(PEM_COMPANY_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_RELEASE)-voip.pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_RELEASE) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_RELEASE).pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_RELEASE) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_RELEASE)-dev.pem  --development

.PHONY: fastlane.pem.adhoc
fastlane.pem.adhoc: deps.fastlane deps.ios config.staff
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_ADHOC) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_ADHOC).pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_ADHOC) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_ADHOC)-dev.pem --development
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_ADHOC) team_id:$(PEM_COMPANY_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_ADHOC)-voip.pem

.PHONY: fastlane.pem.enterprise
fastlane.pem.enterprise: deps.fastlane deps.ios config.yolo
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_HOUSE) --team_id $(PEM_ENTERPRISE_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_HOUSE).pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_HOUSE) --team_id $(PEM_ENTERPRISE_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_HOUSE)-dev.pem --development
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_HOUSE) team_id:$(PEM_ENTERPRISE_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_HOUSE)-voip.pem

.PHONY: fastlane.setup_circle
fastlane.setup_circle:
	bundle exec fastlane run create_keychain timeout:3600 default_keychain:true unlock:true add_to_search_list:true

	# fetch app store profile
	bundle exec fastlane run match type:appstore \
									app_identifier:$(IOS_BUNDLE_ID_RELEASE) \
									readonly:true keychain_name:$(KEYCHAIN_NAME) \
									keychain_password:$(KEYCHAIN_PASSWORD) \
									team_id:"$(MATCH_COMPANY_TEAM_ID)"

	# fetch adhoc profile
	bundle exec fastlane run match type:adhoc \
									app_identifier:$(IOS_BUNDLE_ID_ADHOC) \
									readonly:true keychain_name:$(KEYCHAIN_NAME) \
									keychain_password:$(KEYCHAIN_PASSWORD) \
									team_id:"$(MATCH_COMPANY_TEAM_ID)"

	# fetch enterprise profile
	bundle exec fastlane run match type:enterprise \
									app_identifier:$(IOS_BUNDLE_ID_HOUSE) \
									readonly:true keychain_name:$(KEYCHAIN_NAME) \
									keychain_password:$(KEYCHAIN_PASSWORD) \
									team_id:"$(MATCH_ENTERPRISE_TEAM_ID)"

	security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $(KEYCHAIN_PASSWORD) $(KEYCHAIN_NAME)


.PHONY: fastlane.ios.debug
fastlane.ios.debug: deps.fastlane deps.ios config.debug
	mkdir -p $(IOS_BUILD)

	FL_BUILDLOG_PATH=$(IOS_BUILD) \
	GYM_CLEAN=false \
	GYM_OPTION_METHOD=development \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_DEBUG) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_DEBUG) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_WORKSPACE=ios/Berty.xcworkspace \
	GYM_SCHEME=debug \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

.PHONY: fastlane.ios.adhoc
fastlane.ios.adhoc: deps.fastlane deps.ios config.staff
	mkdir -p $(IOS_BUILD)

	FL_BUILDLOG_PATH=$(IOS_BUILD) \
	GYM_CLEAN=false \
	GYM_OPTION_METHOD=ad-hoc \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_ADHOC) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_ADHOC) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_WORKSPACE=ios/Berty.xcworkspace \
	GYM_SCHEME=adhoc \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

	# test if ipa has been correctly exported
	test -f $(IOS_BUILD)/$(NAME).ipa

	# extract build informations
	unzip -p $(IOS_BUILD)/$(NAME).ipa Payload/*.app/embedded.mobileprovision | security cms -D > $(IOS_BUILD)/$(NAME).embedded.mobileprovision.txt

.PHONY: fastlane.ios.house
fastlane.ios.house: deps.fastlane deps.ios config.yolo
	mkdir -p $(IOS_BUILD)

	FL_BUILDLOG_PATH=$(IOS_BUILD) \
	GYM_CLEAN=true \
	GYM_OPTION_METHOD=enterprise \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_HOUSE) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_HOUSE) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_WORKSPACE=ios/Berty.xcworkspace \
	GYM_SCHEME=house \
	GYM_SKIP_PROFILE_DETECTION=true \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

	# test if ipa has been correctly exported
	test -f $(IOS_BUILD)/$(NAME).ipa

	# extract build informations
	unzip -p $(IOS_BUILD)/$(NAME).ipa Payload/*.app/embedded.mobileprovision | security cms -D > $(IOS_BUILD)/$(NAME).embedded.mobileprovision.txt

.PHONY: fastlane.ios.release
fastlane.ios.release: deps.fastlane deps.ios config.release
	mkdir -p $(IOS_BUILD)

	FL_BUILDLOG_PATH=$(IOS_BUILD) \
	GYM_CLEAN=true \
	GYM_OPTION_METHOD=app-store \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_RELEASE) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_RELEASE) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_WORKSPACE=ios/Berty.xcworkspace \
	GYM_SCHEME=house \
	GYM_SKIP_PROFILE_DETECTION=true \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

	# test if ipa has been correctly exported
	test -f $(IOS_BUILD)/$(NAME).ipa

	# extract build informations
	unzip -p $(IOS_BUILD)/$(NAME).ipa Payload/*.app/embedded.mobileprovision | security cms -D > $(IOS_BUILD)/$(NAME).embedded.mobileprovision.txt

.PHONY: fastlane.ios.release.appstore
fastlane.ios.release.appstore: deps.fastlane fastlane.ios.release config.release
	time bundle exec fastlane run pilot upload --verbose ipa:$(IOS_BUILD)/Berty.ipa skip_waiting_for_build_processing:true

.PHONY: fastlane.android.staff
fastlane.android.staff: deps.fastlane deps.android config.staff
	# get the google-services.json
	[ -e $(PWD)/android/app/google-services.json ] \
		|| echo  $$GOOGLE_SERVICES | base64 --decode > $(PWD)/android/app/google-services.json

	mkdir -p $(ANDROID_BUILD)

	ORG_GRADLE_PROJECT_BERTY_CUSTOM_NAME="$(ANDROID_CUSTOM_NAME)" \
	ORG_GRADLE_PROJECT_BERTY_APK_OUTPUT_DIR="$(shell realpath '$(ANDROID_BUILD)')" \
	FL_GRADLE_PROJECT_DIR=android \
	FL_GRADLE_BUILD_TYPE=Staff \
	FL_GRADLE_TASK=assemble \
		bundle exec fastlane run gradle --verbose

	# check if apk is correctly signed
	jarsigner -verify $(ANDROID_BUILD)/*.apk

.PHONY: fastlane.android.yolo
fastlane.android.yolo: deps.fastlane deps.android config.yolo
	# get the google-services.json
	[ -e $(PWD)/android/app/google-services.json ] \
		|| echo  $$GOOGLE_SERVICES | base64 --decode > $(PWD)/android/app/google-services.json

	mkdir -p $(ANDROID_BUILD)

	ORG_GRADLE_PROJECT_BERTY_APK_OUTPUT_DIR="$(shell realpath '$(ANDROID_BUILD)')" \
	FL_GRADLE_PROJECT_DIR=android \
	FL_GRADLE_BUILD_TYPE=Yolo \
	FL_GRADLE_TASK=assemble \
		bundle exec fastlane run gradle --verbose

	# check if apk is correctly signed
	jarsigner -verify $(ANDROID_BUILD)/*.apk

.PHONY: fastlane.android.release
fastlane.android.release: deps.fastlane deps.android config.release
	# get the google-services.json
	[ -e $(PWD)/android/app/google-services.json ] \
		|| echo  $$GOOGLE_SERVICES | base64 --decode > $(PWD)/android/app/google-services.json

	mkdir -p $(ANDROID_BUILD)

	ORG_GRADLE_PROJECT_BERTY_APK_OUTPUT_DIR="$(shell realpath '$(ANDROID_BUILD)')" \
	FL_GRADLE_PROJECT_DIR=android \
	FL_GRADLE_BUILD_TYPE=Release \
	FL_GRADLE_TASK=assemble \
		bundle exec fastlane run gradle --verbose

	# check if apk is correctly signed
	jarsigner -verify $(ANDROID_BUILD)/*.apk
