# Deps / build related
ROOT := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
WEB := $(ROOT)/web
GOMOB := $(ROOT)/gomobile
IOS := $(ROOT)/ios
ANDROID := $(ROOT)/android

# Fastlane build related
IOS_VERSION ?= $(shell git describe --tags --always  | cut -d - -f 1,2 | tr - .| tail -c +2)
ANDROID_VERSION ?= $(shell git rev-list --all --count)

NAME ?= berty
BUILD ?= .build
BUILD_IOS ?= $(BUILD)/ios
BUILD_ANDROID ?= $(BUILD)/android

KEYCHAIN_NAME ?= berty_keychain
KEYCHAIN_PASSWORD ?= berty_pass

# Dockerised webapp related
SCALE ?= 1
PORT ?= 0
SERV ?=

.PHONY: help
help:
	@echo "React-Native commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'


### Dependencies part ###
.PHONY: deps
deps:
	cd $(ROOT) && yarn

.PHONY: deps.android
deps.android: deps
	$(MAKE) -C $(GOMOB) build.android
	cd $(ROOT) && react-native link

.PHONY: deps.ios
deps.ios: deps
	$(MAKE) -C $(GOMOB) build.ios
	if [ ! -e $(ROOT)/node_modules/react-native/third-party/glog-0.*/Makefile ]; then	\
		cd $(ROOT)/node_modules/react-native											\
			&& rm -rf third-party														\
			&& ./scripts/ios-install-third-party.sh										\
			&& cd third-party/glog-0.*													\
			&& ../../scripts/ios-configure-glog.sh;										\
	fi
	cd $(ROOT) && react-native link

.PHONY: deps.web
deps.web: deps
	cd $(WEB) && yarn
##############################


### Build release/debug part ###
.PHONY: debug.android
debug.android: deps.android
	cd $(ROOT) && react-native run-android --no-packager	\
		&& react-native start --reset-cache

.PHONY: release.android
release.android: deps.android
	@echo "Not implemented yet"

.PHONY: debug.ios
debug.ios: deps.ios
	cd $(ROOT) && react-native run-ios --no-packager --configuration=Debug --scheme=debug --device '$(device)'	\
		&& react-native start --reset-cache

.PHONY: release.ios
release.ios: deps.ios
	cd $(ROOT) && react-native run-ios --no-packager --configuration=Release --scheme=release --device '$(device)'

.PHONY: debug.web
debug.web: deps.web
	@echo "Not implemented yet"
##############################


### Clean dependencies part ###
.PHONY: clean
clean:
	cd $(ROOT)					\
		&& rm -rf node_modules	\
		&& yarn cache clean		\
		&& watchman watch-del-all
	rm -rf $$TMPDIR/metro-*
	rm -rf $$TMPDIR/react-*
	rm -rf $$TMPDIR/haste-*

.PHONY: clean.android
clean.android: clean
	$(MAKE) -C $(GOMOB) clean.android
	cd $(ANDROID) && rm -rf build && ./gradlew clean

.PHONY: clean.ios
clean.ios: clean
	$(MAKE) -C $(GOMOB) clean.ios
	cd $(IOS) && rm -rf build && xcodebuild clean

.PHONY: clean.web
clean.web: clean
	cd $(WEB)					\
		&& rm -rf node_modules	\
		&& yarn cache clean		\
		&& watchman watch-del-all

.PHONY: re.android
re.android: clean.android debug.android

.PHONY: re.ios
re.ios: clean.ios debug.ios

.PHONY: re.web
re.web: clean.web debug.web
##############################


### Dockerized webapp part ###
webapp.start:
	@docker-compose up -d --build --scale core-service=$(SCALE)

webapp.stop:
	@docker-compose stop -t 42

webapp.list:
	@docker ps -f name=react-native_core-service --format "{{.Names}}\tid: {{.ID}}\tport: {{.Ports}}" | sort \
		| sed 's/\(0\.\)\{3\}0:1\([0-9]\)\{3\}->1\([0-9]\)\{3\}\/tcp\, \(0\.\)\{3\}0://g' | sed 's/->.*$$//g'

webapp.logs:
	@docker-compose logs -f $(SERV)

webapp.open:
	@GQL_PORTS=`docker ps -f name=react-native_core-service --format "{{.Ports}}" |			\
				awk 'match($$0,/:8[0-9]{3}->/) {print substr($$0,RSTART+1,RLENGTH-3)}'`;	\
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
	@docker-compose build --pull

webapp.rm: webapp.stop
	@CONT_ID=`echo $$(docker ps -a -f name=react-native_core-service -q)		\
					$$(docker ps -a -f name=react-native_tracer-service -q)		\
					$$(docker ps -a -f name=react-native_web-service -q)`;		\
	COUNT=$$(echo "$$CONT_ID" | sed '/^\s*$$/d' | wc -w | tr -d ' ');			\
	echo "Deleting $$COUNT previously generated containers...";					\
	if [ $$COUNT -ne 0 ]; then docker rm $$CONT_ID; fi
##############################


### Fastlane build part ###
.PHONY: version
version:
	mkdir -p $(BUILD)

	plutil -replace CFBundleShortVersionString -string $(IOS_VERSION) $(IOS)/berty/Info.plist
	bundle exec fastlane run increment_version_code version_code:$(ANDROID_VERSION) gradle_file_path:$(ANDROID)/app/build.gradle
	echo "ios:$(IOS_VERSION)\nandroid:$(ANDROID_VERSION)\n" > $(BUILD)/version

fastlane.match.development:
	time bundle exec fastlane run match type:development

fastlane.match.appstore:
	time bundle exec fastlane run match type:appstore

fastlane.match.adhoc:
	time bundle exec fastlane run match force_for_new_devices:true type:adhoc

fastlane.match.enterprise:
	time bundle exec fastlane run match type:enterprise

fastlane.setup_circle:
	bundle exec fastlane run create_keychain timeout:3600 default_keychain:true unlock:true add_to_search_list:true
	bundle exec fastlane run match type:appstore readonly:true keychain_name:$(KEYCHAIN_NAME) keychain_password:$(KEYCHAIN_PASSWORD)
	bundle exec fastlane run match type:adhoc readonly:true keychain_name:$(KEYCHAIN_NAME) keychain_password:$(KEYCHAIN_PASSWORD)
	security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $(KEYCHAIN_PASSWORD) $(KEYCHAIN_NAME)

fastlane.ios.build:
	mkdir -p $(BUILD_IOS)

	GYM_CLEAN=false \
	GYM_OPTION_METHOD=ad-hoc \
	GYM_OPTION_APP_ID=chat.berty.ios \
	GYM_OPTION_PROVISIONING_PROFILE='match AdHoc chat.berty.ios' \
	GYM_OUTPUT_NAME=$(NAME) \
	GYM_OUTPUT_DIRECTORY=$(BUILD_IOS) \
	GYM_PROJECT=ios/berty.xcodeproj \
	GYM_SCHEME=adhoc \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

	# extract build informations
	unzip -p $(BUILD_IOS)/$(NAME).ipa Payload/berty.app/embedded.mobileprovision | security cms -D > $(BUILD_IOS)/$(NAME).embedded.mobileprovision.txt || true

fastlane.ios.release:
	time bundle exec fastlane run pilot upload --verbose ipa:$(BUILD_IOS)/berty.ipa skip_waiting_for_build_processing:true
##############################
