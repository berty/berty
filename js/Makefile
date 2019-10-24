export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

UNAME_S ?= $(shell uname -s)

author = Berty Technologies <oss@berty.tech>
contributor = $(shell git config --get user.name) <$(shell git config --get user.email)>
license = (Apache-2.0 or MIT)

yarn := $(shell which yarn || echo '/usr/local/bin/yarn')

yarn_flags :=

mod := $(PWD)/node_modules
bin := $(mod)/.bin

lerna := $(bin)/lerna
lerna_flags := --reject-cycles --concurrency=8
lerna_upgrade := $(bin)/upd
lerna_exec := $(lerna) $(lerna_flags) exec --stream --parallel --scope=$1 --

json := $(bin)/json
caser := $(bin)/caser
eslint := $(bin)/eslint

pkg := $(filter-out $(PWD)/packages, $(shell find $(PWD)/packages -maxdepth 1 -type d))
pkg_mod := $(patsubst %, %/node_modules, $(pkg))
pkg_desc := $(patsubst %, %/package.json, $(pkg))

.DEFAULT_GOAL := deps

print-%  : ; @echo $* = $($*)

.PHONY: env
env:
	@env

$(yarn):
	$(error "yarn is not installed")

.PHONY: deps
deps: $(yarn) $(lerna) $(mod) $(pkg_mod) gen

$(mod) $(pkg_mod): $(PWD)/package.json $(pkg)
	$(lerna) $(lerna_flags) init
	$(lerna) $(lerna_flags) bootstrap
	mkdir -p $(mod) $(pkg_mod)
	touch $(mod) $(pkg_mod)

$(lerna): $(yarn)
	$(yarn) add -W lerna@latest

.PHONY: upgrade
upgrade: deps
	$(lerna_upgrade)

.IGNORE \
.PHONY: clean
clean:

.IGNORE \
.PHONY: fclean
fclean: clean
	rm -rf $(pkg_mod)
	rm -rf $(mod)
	yarn cache clean -f

.PHONY: pkg
pkg: name ?= example
pkg: export PWD := $(PWD)
pkg: deps
	$(lerna) create @berty-tech/$(name) \
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
rnpkg: deps
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
lint: options += --cache
lint: deps
	$(eslint) $(options) $(files)

.PHONY: lint.fix
lint.fix: options += --fix
lint.fix: lint

.PHONY: lint.watch
lint.watch: options += --watch
lint.watch: lint

include packages/api-chat/Makefile
include packages/berty-app/Makefile
include packages/storybook-mobile/Makefile
include packages/storybook-web/Makefile
include packages/react-native-core/Makefile
