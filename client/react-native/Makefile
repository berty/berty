PWD := $(shell pwd)
ROOT := .
DIRS := common mobile web gomobile
DEPS := $(addsuffix /node_modules, $(DIRS) $(ROOT))
CLEAN := $(addsuffix .clean, $(DIRS) $(ROOT))
FCLEAN := $(addsuffix .fclean, $(DIRS) $(ROOT))
RE := $(addsuffix .re, $(DIRS) $(ROOT))

.PHONY: all
all: $(ROOT) $(DEPS)

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
android: gomobile mobile
	cd mobile && yarn android && yarn start

.PHONY: ios
ios: gomobile mobile
	cd mobile && yarn ios --device $(device) && yarn start

.PHONY: $(FCLEAN)
$(FCLEAN):
	rm -rf $(basename $@)/node_modules

.PHONY: $(RE)
$(RE): %.re: %.fclean %/node_modules
