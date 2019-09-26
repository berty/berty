export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

UNAME_S ?= $(shell uname -s)

author = Berty Technologies <oss@berty.tech>
contributor = $(shell git config --get user.name) <$(shell git config --get user.email)>
license = (Apache-2.0 or MIT)

ifeq ($(UNAME_S),Darwin)
export SHELL = /bin/bash
npm := /usr/local/bin/npm
pkg := $(shell find $(PWD)/packages -depth 1 -type d)
endif
ifeq ($(UNAME_S),Linux)
export SHELL = /usr/bin/bash
npm := /usr/bin/npm
pkg := $(filter-out $(PWD)/packages, $(shell find $(PWD)/packages -maxdepth 1 -type d))
else
endif
npm_flags := --no-progress

mod := $(PWD)/node_modules
bin := $(mod)/.bin

lerna := $(bin)/lerna
lerna_flags := --reject-cycles --concurrency=8
lerna_upgrade := $(bin)/upd
lerna_exec := $(lerna) $(lerna_flags) exec --stream --parallel --scope=$1 --

json := $(bin)/json
caser := $(bin)/caser
eslint := $(bin)/eslint

pkg ?= $(shell find $(PWD)/packages -depth 1 -type d)
pkg_mod := $(patsubst %, %/node_modules, $(pkg))
pkg_desc := $(patsubst %, %/node_modules, $(pkg))

.DEFAULT_GOAL := deps

.PHONY: bootstrap
deps: $(mod) $(pkg_mod)

$(mod) $(mod)/%: package.json
	$(npm) $(npm_flags) install
	$(lerna) $(lerna_flags) init
	touch $(mod)

print-%  : ; @echo $* = $($*)

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
fclean:
	rm -rf $(pkg_mod)
	rm -rf $(mod)
	npm cache clean -f

.PHONY: pkg
pkg: name ?= example
pkg: export PWD := $(PWD)
pkg: $(mod)
	lerna create @berty-tech/$(name) \
		--access restricted \
		--private \
		--license '$(license)' \
		--yes
	cd $(PWD)/packages/$(name) \
		&& $(json) -I -f package.json -e "this.description=''" \
		&& $(json) -I -f package.json -e "this.author='$(author)'"

.PHONY: rnpkg
rnpkg: name ?= example
rnpkg: pascal-name = $(shell echo $(name) | $(caser) --pascal)
rnpkg: export PWD := $(PWD)
rnpkg: $(mod)
	cd $(PWD)/packages \
		&& create-react-native-module \
			--platforms ios,android \
			--prefix Berty \
			--package-identifier tech.berty.$(name) \
			--license '$(license)' \
			--use-cocoapods \
			--github-account berty \
			--author-name 'Berty Technologies' \
			--author-email oss@berty.tech \
			$(name)
	cd $(PWD)/packages/react-native-$(name) \
		&& rm -rf README.md \
		&& $(json) -I -f package.json -e "this.name='@berty-tech/react-native-$(name)'" \
		&& $(json) -I -f package.json -e "this.description='Berty\'s react-native $(name) library'" \
		&& $(json) -I -f package.json -e "this.author='$(author)'" \
		&& $(json) -I -f package.json -e "this.licenseFilename=undefined"
	cd $(PWD)/packages/react-native-$(name) \
		&& sed -i.bak 's/s.license      = "MIT"/s.license      = package["license"]/g' react-native-$(name).podspec \
		&& rm react-native-$(name).podspec.bak
	cd $(PWD)/packages/react-native-$(name)/ios/Berty$(pascal-name).xcodeproj \
		&& sed -i.bak 's/ORGANIZATIONNAME = Facebook/ORGANIZATIONNAME = "Berty Technologies"/g' project.pbxproj \
		&& rm project.pbxproj.bak

.PHONY: lint
lint: export PWD := $(PWD)
lint: files = $(shell \
		find packages -type f -not -path '*/node_modules/*' \
		| grep -E '(\.js|\.jsx|\.ts|\.tsx)$$'\
	)
lint: deps
	$(eslint) $(options) $(files)

.PHONY: lint.fix
lint.fix: options += --fix
lint.fix: lint

.PHONY: lint.watch
lint.watch: options += --watch
lint.watch: lint

include packages/berty-app/Makefile
include packages/storybook-mobile/Makefile
include packages/storybook-web/Makefile
include packages/react-native-core/Makefile

