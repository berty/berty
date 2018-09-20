PWD := $(shell pwd)
ROOT := $(PWD)
DIRS := common mobile web gomobile
DEPS := $(addsuffix /node_modules, $(DIRS) $(ROOT))
CLEAN := $(addsuffix .clean, $(DIRS) $(ROOT))
FCLEAN := $(addsuffix .fclean, $(DIRS) $(ROOT))
RE := $(addsuffix .re, $(DIRS) $(ROOT))
START := $(addsuffix .start, $(DIRS) $(ROOT))
BUILD := $(addsuffix .build, $(DIRS) $(ROOT))
XCODE_MAJOR := $(shell xcodebuild -version | head -1 | sed 's~^Xcode \(.*\)\..*$$~\1~')

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
	(patch -N ./node_modules/react-native/scripts/ios-install-third-party.sh ./patch/ios-install-third-party.sh.patch \
	&& patch -N ./node_modules/react-native/Libraries/WebSocket/RCTWebSocket.xcodeproj/project.pbxproj ./patch/project.pbxproj.patch \
	&& cd ./node_modules/react-native && ./scripts/ios-install-third-party.sh) || true
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
