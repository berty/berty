export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export SHELL := /bin/bash

npm := /usr/local/bin/npm
npm_flags := --no-progress

mod := node_modules
bin := $(mod)/.bin

lerna := $(bin)/lerna
lerna_flags := --reject-cycles --no-progress --concurrency=8
lerna_upgrade := $(bin)/lernaupdate

expo := $(bin)/expo
expo_flags := packages/app

pkg := $(shell find packages -depth 1 -type d)
pkg_mod := $(patsubst %, %/node_modules, $(pkg))

.PHONY: deps
deps: $(mod) $(pkg_mod)

.PHONY: npm
npm $(npm):
ifeq ($(UNAME_S),Darwin)
	brew install node
endif
ifeq ($(UNAME_S),Linux)
	apt-get install nodejs
endif

.PHONY: lerna
lerna: deps

.PHONY: expo
expo: deps

.PHONY: mod
mod $(mod) $(mod)/%: package.json
	$(npm) $(npm_flags) install
	$(lerna) $(lerna_flags) init
	touch $(mod)

.PHONY: upgrade
upgrade: $(lerna_upgrade)
	$(lerna_upgrade)

.PHONY: pkg
pkg: $(lerna)
	$(lerna) $(lerna_flags) bootstrap
	touch $(pkg)

.NOTPARALLEL: packages/%
$(pkg_mod): packages/%/node_modules: packages/%/package.json | $(lerna)
	$(lerna) $(lerna_flags) bootstrap
	touch $(pkg) $@

.IGNORE \
.PHONY:
clean:
	rm -rf \
		$(mod) \
		$(pkg_mod)

.PHONY: lib
lib: name := example
lib: $(mod)
	$(lerna) $(lerna_flags) create @berty/$(name) packages/$(name)
	cd packages && create-react-native-module \
		--platforms ios,android \
		--prefix Berty \
		--package-identifier tech.berty.$(name) \
		--license Apache-2.0 \
		--use-cocoapods \
		--github_account berty \
		--author-name 'Berty Technologies' \
		--author-email staff@berty.tech \
		$(name)
