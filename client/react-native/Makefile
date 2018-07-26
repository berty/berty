PWD := $(shell pwd)
ROOT := .
DIRS := common mobile web gomobile
DEPS := $(addsuffix /node_modules, $(DIRS) $(ROOT))
CLEAN := $(addsuffix .clean, $(DIRS) $(ROOT))
FCLEAN := $(addsuffix .fclean, $(DIRS) $(ROOT))
RE := $(addsuffix .re, $(DIRS) $(ROOT))

.PHONY: all
all: $(ROOT) $(DEPS)

.PHONY: fclean
fclean: $(FCLEAN)

.PHONY: re
re: $(RE)

$(ROOT)/node_modules $(DEPS): %/node_modules: %/package.json
	cd $(dir $@) && yarn

.PHONY: $(DIRS)
$(DIRS): %: %/node_modules $(ROOT)/node_modules
	cd $@ && yarn start

.PHONY: android
android: gomobile mobile
	cd mobile && yarn android

.PHONY: ios
ios: gomobile mobile
	cd mobile && yarn ios --device $(device)

.PHONY: $(FCLEAN)
$(FCLEAN):
	rm -rf $(basename $@)/node_modules

.PHONY: $(RE)
$(RE): %.re: %.fclean %/node_modules
