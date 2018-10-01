IOS_VERSION ?= $(shell git describe --tags --always  | cut -d - -f 1,2 | tr - .| tail -c +2)
ANDROID_VERSION ?= $(shell git rev-list --all --count)
XCODE_MAJOR := $(shell xcodebuild -version | head -1 | sed 's~^Xcode \(.*\)\..*$$~\1~')

PWD := $(shell pwd)
ROOT := $(PWD)
DIRS := common mobile web gomobile
DEPS := $(addsuffix /node_modules, $(DIRS) $(ROOT))
CLEAN := $(addsuffix .clean, $(DIRS) $(ROOT))
FCLEAN := $(addsuffix .fclean, $(DIRS) $(ROOT))
RE := $(addsuffix .re, $(DIRS) $(ROOT))
START := $(addsuffix .start, $(DIRS) $(ROOT))

BUILD ?= .build
BUILD_IOS ?= $(BUILD)/ios
BUILD_ANDROID ?= $(BUILD)/android

KEYCHAIN_NAME ?= berty_keychain
KEYCHAIN_PASSWORD ?= berty_pass

SCALE ?= 1
PORT ?= 0

.PHONY: all
all: $(ROOT) $(DEPS)

.PHONY: help
help:
	@echo "React-Native commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

.PHONY: deps
deps: $(DEPS)

.PHONY: fclean
fclean: $(FCLEAN)
	yarn cache clean && watchman watch-del-all

.PHONY: re
re: $(RE)

$(DEPS): %/node_modules: %/package.json
	cd $(dir $@) && yarn

.PHONY: $(DIRS)
$(DIRS): %: %/node_modules $(ROOT)/node_modules

.PHONY: android
android: mobile
	make -C gomobile android
	cd mobile && yarn android && yarn start


.PHONY: patch-xcode10
patch-xcode10:
ifeq ("$(XCODE_MAJOR)", "10")
	cd node_modules/react-native \
		&& cp scripts/ios-install-third-party.sh . \
		&& rm -rf third-party \
		&& ./ios-install-third-party.sh \
		&& cp scripts/ios-configure-glog.sh third-party/glog-0.3.4 \
		&& cd third-party/glog-0.3.4 \
		&& ./ios-configure-glog.sh
	patch -N ./node_modules/react-native/Libraries/WebSocket/RCTWebSocket.xcodeproj/project.pbxproj ./patch/project.pbxproj.patch || true
else
	@echo "patch-xcode10: skipping patch, using xcode $(XCODE_MAJOR)"
endif

.PHONY: ios
ios: mobile patch-xcode10
	make -C gomobile ios
	cd mobile && yarn ios --device '$(device)' && yarn start

.PHONY: $(FCLEAN)
$(FCLEAN):
	rm -rf $(basename $@)/node_modules

.PHONY: $(RE)
$(RE): %.re: %.fclean %/node_modules

$(START): %.start: %
	cd $< && yarn start

$(BUILD): %.build: %
	cd $< && yarn build

webapp.start:
	@docker-compose up -d --build --scale core-service=$(SCALE)

webapp.stop:
	@docker-compose stop -t 42

webapp.list:
	@docker ps -f name=react-native_core-service --format "{{.Names}}\tid: {{.ID}}\tport: {{.Ports}}" | sort \
		| sed 's/\(0\.\)\{3\}0:1\([0-9]\)\{3\}->1\([0-9]\)\{3\}\/tcp\, \(0\.\)\{3\}0://g' | sed 's/->.*$$//g'

webapp.logs:
	@docker-compose logs -f

webapp.open:
	@GQL_PORTS=`docker ps -f name=react-native_core-service --format "{{.Ports}}" |			\
				awk 'match($$0,/:8[0-9]{3}->/) {print substr($$0,RSTART+1,RLENGTH-3)}'`;	\
	COUNT=$$(echo "$$GQL_PORTS" | sed '/^\s*$$/d' | wc -l | tr -d ' ');						\
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

webapp.rebuild:
	@docker-compose build --pull

webapp.rm:
	@CONT_ID=`echo $$(docker ps -a -f name=react-native_core-service -q) $$(docker ps -a -f name=react-native_web-service -q)`;	\
	COUNT=$$(echo "$$CONT_ID" | sed '/^\s*$$/d' | wc -w | tr -d ' ');															\
	echo "Deleting $$COUNT previously generated containers...";																	\
	if [ $$COUNT -ne 0 ]; then docker rm $$CONT_ID; fi

.PHONY: version
version:
	plutil -replace CFBundleShortVersionString -string $(IOS_VERSION) mobile/ios/berty/Info.plist
	bundle exec fastlane run increment_version_code version_code:$(ANDROID_VERSION) gradle_file_path:./mobile/android/app/build.gradle

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
	GYM_OUTPUT_NAME=berty \
	GYM_PROJECT=mobile/ios/berty.xcodeproj \
	GYM_SCHEME=adhoc \
	GYM_INCLUDE_SYMBOLS=false \
		time bundle exec fastlane ios build --verbose

fastlane.ios.release:
	time bundle exec fastlane run pilot upload --verbose ipa:$(BUILD_IOS)/berty.ipa skip_waiting_for_build_processing:true
