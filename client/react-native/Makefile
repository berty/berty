PWD := $(shell pwd)
ROOT := .
DIRS := common mobile web gomobile
DEPS := $(addsuffix /node_modules, $(DIRS) $(ROOT))
CLEAN := $(addsuffix .clean, $(DIRS) $(ROOT))
FCLEAN := $(addsuffix .fclean, $(DIRS) $(ROOT))
RE := $(addsuffix .re, $(DIRS) $(ROOT))
START := $(addsuffix .start, $(DIRS) $(ROOT))
BUILD := $(addsuffix .build, $(DIRS) $(ROOT))

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

$(ROOT)/node_modules $(DEPS): %/node_modules: %/package.json
	cd $(dir $@) && yarn

.PHONY: $(DIRS)
$(DIRS): %: %/node_modules $(ROOT)/node_modules

.PHONY: android
android: mobile
	make -C gomobile android
	cd mobile && yarn android && yarn start

.PHONY: ios
ios: mobile
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
