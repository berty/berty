export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

# Deps / build related
IOS := $(PWD)/ios
ANDROID := $(PWD)/android
DESKTOP := $(PWD)/desktop


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

# Misc.
.PHONY: help
help:
	@echo "React-Native commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

.PHONY: get_iphone_udid
get_iphone_udid:
	$(eval IOS_UDID = $(shell ios-deploy -c | grep 'Found' | head -n 1 | cut -d ' ' -f 3))
	@if [ -z '$(IOS_UDID)' ]; then						\
		echo 'No iOS device connected';					\
	else												\
		echo 'iOS device found with UDID: $(IOS_UDID)';	\
	fi
	$(eval IOS_UDID = $(shell if [ -n '$(IOS_UDID)' ]; then echo '--udid $(IOS_UDID)'; fi))

.PHONY: deps
deps:
	[ -e node_modules/$(package) ] || lerna add --scope=@berty/platform @berty/$(package)

.PHONY: deps.android
deps.android: deps
	[ -e $(PWD)/android/app/google-services.json ] \
		|| (echo '\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' \
		&& echo '!!! google-services.json not configured !!!' \
		&& echo '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' \
		&& echo 'Go to Berty Technologies project from https://console.firebase.google.com/' \
		&& echo 'Go to chat.berty.main.debug or chat.berty.main and dl google-services.json' \
		&& echo 'Add google-services.json in:\n$(PWD)/android/app\n' \
		&& false)
	react-native link

.PHONY: deps.ios
deps.ios: deps
	if [ ! -e ./node_modules/react-native/third-party/glog-0.*/Makefile ]; then	\
		cd ./node_modules/react-native											\
			&& rm -rf third-party														\
			&& ./scripts/ios-install-third-party.sh										\
			&& cd third-party/glog-0.*													\
			&& ../../scripts/ios-configure-glog.sh;										\
	fi
	react-native link

.PHONY: deps.web
deps.web: deps web/node_modules

web/node_modules: web/package.json
	cd web && npm install

.PHONY: deps.logs
deps.logs:
	brew install --HEAD pidcat
##############################

### Build release/debug part ###
.PHONY: debug.react-native
debug.react-native:
	react-native start --reset-cache

.PHONY: patch.android
patch.android:
	@if [ -z "$$(sed -n 4p node_modules/react-native-network-info/android/build.gradle | grep 'url \"https://maven.google.com\"')" ]; then \
		mv node_modules/react-native-network-info/android/build.gradle node_modules/react-native-network-info/android/build.gradle_topatch; \
		patch node_modules/react-native-network-info/android/build.gradle_topatch -i patch/gradle.patch -o node_modules/react-native-network-info/android/build.gradle; \
	fi

.PHONY: debug.android
debug.android: deps.android patch.android
	react-native run-android --no-packager
	make debug.react-native

.PHONY: release.android
release.android: deps.android
	source .environment \
		&& export APP_TOKEN="$$INSTABUG_TOKEN" \
		&& react-native run-android --variant=release --no-packager

.PHONY: deps.desktop
deps.desktop: deps.web

.PHONY: release.desktop
release.desktop: deps.desktop

.PHONY .IGNORE: clean.desktop
clean.desktop: clean.web

.PHONY: debug.ios
debug.ios: deps.ios get_iphone_udid
	make debug.react-native &
	react-native run-ios --no-packager --configuration=Debug --scheme=debug $(IOS_UDID)

.PHONY: release.ios
release.ios: deps.ios get_iphone_udid
	react-native run-ios --no-packager --configuration=Release --scheme=release $(IOS_UDID)

.PHONY: adhoc.ios
adhoc.ios: deps.ios get_iphone_udid
	react-native run-ios --no-packager --configuration=Release --scheme=adhoc $(IOS_UDID)

.PHONY: debug.web
debug.web: deps.web
	cd web && npm run start

.PHONY: build.web
build.web: deps.web
	cd web && npm run build

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
	cd $(IOS) && rm -rf build && xcodebuild clean

.PHONY .IGNORE: clean.web
clean.web:
	rm -rf web/*/cache web/*/dist web/node_modules

.PHONY .IGNORE: fclean.android
fclean.android: clean.android clean.bundler_and_pkgs
	cd $(ANDROID) && rm -rf app/build ble/build

.PHONY .IGNORE: fclean.ios
fclean.ios: clean.ios clean.bundler_and_pkgs

.PHONY .IGNORE: fclean.web
fclean.web: clean.web clean.bundler_and_pkgs
	rm -rf web/build

.PHONY .IGNORE: fclean
fclean: fclean.android fclean.ios fclean.web clean.bundler_and_pkgs

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

fastlane.match.development:
	time bundle exec fastlane run match type:development app_identifier:$(IOS_BUNDLE_ID_DEBUG) team_id:$(MATCH_COMPANY_TEAM_ID)

fastlane.match.appstore:
	time bundle exec fastlane run match type:appstore app_identifier:$(IOS_BUNDLE_ID_RELEASE) team_id:$(MATCH_COMPANY_TEAM_ID)

fastlane.match.adhoc:
	time bundle exec fastlane run match force_for_new_devices:true type:adhoc app_identifier:$(IOS_BUNDLE_ID_ADHOC) team_id:$(MATCH_COMPANY_TEAM_ID)

fastlane.match.enterprise:
	time bundle exec fastlane run match type:enterprise app_identifier:$(IOS_BUNDLE_ID_HOUSE) team_id:$(MATCH_ENTERPRISE_TEAM_ID)

fastlane.match.all: fastlane.match.development fastlane.match.appstore fastlane.match.adhoc fastlane.match.enterprise

fastlane.pem.development:
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_DEBUG) team_id:$(PEM_COMPANY_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_DEBUG)-voip.pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_DEBUG) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_DEBUG)-dev.pem --development

fastlane.pem.appstore:
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_RELEASE) team_id:$(PEM_COMPANY_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_RELEASE)-voip.pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_RELEASE) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_RELEASE).pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_RELEASE) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_RELEASE)-dev.pem  --development

fastlane.pem.adhoc:
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_ADHOC) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_ADHOC).pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_ADHOC) --team_id $(PEM_COMPANY_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_ADHOC)-dev.pem --development
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_ADHOC) team_id:$(PEM_COMPANY_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_ADHOC)-voip.pem

fastlane.pem.enterprise:
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_HOUSE) --team_id $(PEM_ENTERPRISE_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_HOUSE).pem
	time bundle exec fastlane pem --app_identifier $(IOS_BUNDLE_ID_HOUSE) --team_id $(PEM_ENTERPRISE_TEAM_ID) --pem_name $(IOS_BUNDLE_ID_HOUSE)-dev.pem --development
	time bundle exec fastlane voip_cert app_identifier:$(IOS_BUNDLE_ID_HOUSE) team_id:$(PEM_ENTERPRISE_TEAM_ID) pem_name:$(IOS_BUNDLE_ID_HOUSE)-voip.pem

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


fastlane.ios.debug:
	mkdir -p $(IOS_BUILD)

	GYM_CLEAN=false \
	GYM_OPTION_METHOD=development \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_DEBUG) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_DEBUG) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_PROJECT=ios/Berty.xcodeproj \
	GYM_SCHEME=debug \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

fastlane.ios.adhoc:
	mkdir -p $(IOS_BUILD)

	GYM_CLEAN=false \
	GYM_OPTION_METHOD=ad-hoc \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_ADHOC) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_ADHOC) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_PROJECT=ios/Berty.xcodeproj \
	GYM_SCHEME=adhoc \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

	# test if ipa has been correctly exported
	test -f $(IOS_BUILD)/$(NAME).ipa

	# extract build informations
	unzip -p $(IOS_BUILD)/$(NAME).ipa Payload/*.app/embedded.mobileprovision | security cms -D > $(IOS_BUILD)/$(NAME).embedded.mobileprovision.txt

fastlane.ios.house:
	mkdir -p $(IOS_BUILD)

	GYM_CLEAN=true \
	GYM_OPTION_METHOD=enterprise \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_HOUSE) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_HOUSE) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_PROJECT=ios/Berty.xcodeproj \
	GYM_SCHEME=house \
	GYM_SKIP_PROFILE_DETECTION=true \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

	# test if ipa has been correctly exported
	test -f $(IOS_BUILD)/$(NAME).ipa

	# extract build informations
	unzip -p $(IOS_BUILD)/$(NAME).ipa Payload/*.app/embedded.mobileprovision | security cms -D > $(IOS_BUILD)/$(NAME).embedded.mobileprovision.txt

fastlane.ios.release:
	mkdir -p $(IOS_BUILD)

	GYM_CLEAN=true \
	GYM_OPTION_METHOD=app-store \
	GYM_OPTION_APP_ID=$(IOS_BUNDLE_ID_RELEASE) \
	GYM_OPTION_PROVISIONING_PROFILE=$(MATCH_PROVISIONING_PROFILE_RELEASE) \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(IOS_BUILD) \
	GYM_PROJECT=ios/Berty.xcodeproj \
	GYM_SCHEME=house \
	GYM_SKIP_PROFILE_DETECTION=true \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

	# test if ipa has been correctly exported
	test -f $(IOS_BUILD)/$(NAME).ipa

	# extract build informations
	unzip -p $(IOS_BUILD)/$(NAME).ipa Payload/*.app/embedded.mobileprovision | security cms -D > $(IOS_BUILD)/$(NAME).embedded.mobileprovision.txt

fastlane.ios.release.appstore: fastlane.ios.release
	time bundle exec fastlane run pilot upload --verbose ipa:$(IOS_BUILD)/Berty.ipa skip_waiting_for_build_processing:true

fastlane.android.staff: clean.android
	# get the google-services.json
	[ -e $(PWD)/android/app/google-services.json ] \
		|| echo  $$GOOGLE_SERVICES | base64 --decode > )/android/app/google-services.json

	mkdir -p $(ANDROID_BUILD)

	ORG_GRADLE_PROJECT_BERTY_CUSTOM_NAME="$(ANDROID_CUSTOM_NAME)" \
	ORG_GRADLE_PROJECT_BERTY_APK_OUTPUT_DIR="$(shell realpath '$(ANDROID_BUILD)')" \
	FL_GRADLE_PROJECT_DIR=android \
	FL_GRADLE_BUILD_TYPE=Staff \
	FL_GRADLE_TASK=assemble \
		bundle exec fastlane run gradle --verbose

	# check if apk is correctly signed
	jarsigner -verify $(ANDROID_BUILD)/*.apk

fastlane.android.yolo: clean.android
	# get the google-services.json
	[ -e )/android/app/google-services.json ] \
		|| echo  $$GOOGLE_SERVICES | base64 --decode > )/android/app/google-services.json

	mkdir -p $(ANDROID_BUILD)

	ORG_GRADLE_PROJECT_BERTY_APK_OUTPUT_DIR="$(shell realpath '$(ANDROID_BUILD)')" \
	FL_GRADLE_PROJECT_DIR=android \
	FL_GRADLE_BUILD_TYPE=Yolo \
	FL_GRADLE_TASK=assemble \
		bundle exec fastlane run gradle --verbose

	# check if apk is correctly signed
	jarsigner -verify $(ANDROID_BUILD)/*.apk

fastlane.android.release: clean.android
	# get the google-services.json
	[ -e )/android/app/google-services.json ] \
		|| echo  $$GOOGLE_SERVICES | base64 --decode > )/android/app/google-services.json

	mkdir -p $(ANDROID_BUILD)

	ORG_GRADLE_PROJECT_BERTY_APK_OUTPUT_DIR="$(shell realpath '$(ANDROID_BUILD)')" \
	FL_GRADLE_PROJECT_DIR=android \
	FL_GRADLE_BUILD_TYPE=Release \
	FL_GRADLE_TASK=assemble \
		bundle exec fastlane run gradle --verbose

	# check if apk is correctly signed
	jarsigner -verify $(ANDROID_BUILD)/*.apk
