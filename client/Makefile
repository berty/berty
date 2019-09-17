export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export SHELL := /bin/bash

UNAME_S ?= $(shell uname -s)

ifeq ($(UNAME_S),Darwin)
npm := /usr/local/bin/npm
endif
ifeq ($(UNAME_S),Linux)
npm := /usr/bin/npm
endif
npm_flags := --no-progress

mod := $(PWD)/node_modules
bin := $(mod)/.bin

lerna := $(bin)/lerna
lerna_flags := --reject-cycles --concurrency=8
lerna_upgrade := $(bin)/upd
lerna_exec := $(lerna) $(lerna_flags) exec --stream --parallel --scope=$1 --

pkg := $(shell find $(PWD)/packages -depth 1 -type d)
pkg_mod := $(patsubst %, %/node_modules, $(pkg))

include packages/app/Makefile

.DEFAULT_GOAL := deps

.PHONY: bootstrap
deps: $(mod) $(pkg_mod)

$(mod) $(mod)/%: package.json
	$(npm) $(npm_flags) install
	$(lerna) $(lerna_flags) init
	touch $(mod)

.NOTPARALLEL: $(pkg_mod) $(pkg_mod)/%
$(pkg_mod)/%: $(mod) $(patsubst %,%/package.json,$(pkg))
	$(lerna) $(lerna_flags) bootstrap
	mkdir -p $(pkg_mod)
	touch $(pkg_mod) $@

.PHONY: npm
npm $(npm):
ifeq ($(UNAME_S),Darwin)
	brew install node
endif
ifeq ($(UNAME_S),Linux)
	apt-get install nodejs
endif

.PHONY: upgrade
upgrade: $(lerna_upgrade)
	$(lerna_upgrade)

.IGNORE \
.PHONY: clean
clean: clean
	$(lerna_exec) /bin/bash -c '[ ! -f Makefile ] || make clean'; \

.IGNORE \
.PHONY: fclean
fclean: fclean
	$(lerna_exec) /bin/bash -c '[ ! -f Makefile ] || make fclean'; \
	rm -rf \
		$(mod) \
		$(pkg_mod)

.PHONY: pkg
pkg: name ?= example
pkg: $(mod)
	lerna create @berty/$(name) \
		--access restricted \
		--private \
		--license Apache-2.0 \
		--yes \

.PHONY: rnpkg
rnpkg: name ?= example
rnpkg: $(mod)
	cd packages && create-react-native-module \
		--platforms ios,android \
		--prefix Berty$(shell echo "$(name)" | caser --pascal $(name)) \
		--package-identifier tech.berty.$(name) \
		--license Apache-2.0 \
		--use-cocoapods \
		--github_account berty \
		--author-name 'Berty Technologies' \
		--author-email staff@berty.tech \
		$(name)
