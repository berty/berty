export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

BERTY_ROOT = $(abspath $(shell pwd)/..)

UNAME_S ?= $(shell uname -s)

author = Berty Technologies <oss@berty.tech>
contributor = $(shell git config --get user.name) <$(shell git config --get user.email)>
license = (Apache-2.0 or MIT)

yarn := $(shell which yarn || echo '/usr/local/bin/yarn')
yarn_flags :=

go_vendor := $(BERTY_ROOT)/vendor

mod := $(PWD)/node_modules
bin := $(mod)/.bin

lerna := $(bin)/lerna
lerna_flags := --reject-cycles --concurrency=8
lerna_upgrade := $(bin)/upd
lerna_exec := $(lerna) $(lerna_flags) exec --stream --parallel --scope=$1 --

json := $(bin)/json
caser := $(bin)/caser
eslint := $(bin)/eslint

pkg := $(patsubst %/package.json, %, $(filter-out $(PWD)/packages, $(shell find $(PWD)/packages -maxdepth 2 -type f -name 'package.json')))
pkg_mod := $(patsubst %, %/node_modules, $(pkg))
pkg_desc := $(patsubst %, %/package.json,$(pkg))

.DEFAULT_GOAL := deps

print-%  : ; @echo $* = $($*)

.PHONY: env
env:
	@env

.PHONY: deps
deps: $(mod) $(pkg_mod)
deps: $(lerna) $(mod) $(pkg_mod)

$(mod) $(pkg_mod): ci ?= false
$(mod) $(pkg_mod): $(PWD)/package.json $(pkg_desc)
	$(yarn) $(if $(filter $(ci), true), --frozen-lockfile)
	$(lerna) $(lerna_flags) bootstrap
	# remove duplicate instance of react-native
	rm -rf $$(find $(mod) -type d -name react-native -path '*/node_modules/*'  | grep 'node_modules/react-native$$')
	# convert android deps to androidx
	$(bin)/jetifier
	mkdir -p $(mod) $(pkg_mod)
	touch $(mod) $(pkg_mod)

.PHONY: test
test: deps
	yarn test

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
lint: files = .
lint: options += --cache --quiet --ext=.js,.jsx,.ts,.tsx
lint: deps
	cat $(PWD)/.gitignore > $(PWD)/.eslintignore
	echo "*.pb.*" >> $(PWD)/.eslintignore
	echo "*.gen.*" >> $(PWD)/.eslintignore
	$(eslint) $(options) $(files)

.PHONY: lint.fix
lint.fix: options += --fix
lint.fix: lint

.PHONY: lint.watch
lint.watch: options += --watch
lint.watch: lint

.PHONY: gen
gen: deps

.PHONY: gen.clean
gen.clean:
	rm -f $(wildcard \
	  packages/*/*.gen.tsx \
	  packages/*/*.gen.js \
	  packages/*/*.pb.js \
	  packages/*/*.pb.d.ts \
	)

$(HOME)/.android/debug.keystore: $(pkg_mod)
	mkdir -p $(dir $@)
	cp $(BERTY_ROOT)/js/packages/berty-app/node_modules/react-native/template/android/app/debug.keystore $@

include packages/api/Makefile
include packages/berty-store/Makefile
include packages/codegen/Makefile
include packages/go-bridge/Makefile
include packages/berty-app/Makefile
include packages/storybook-mobile/Makefile
include packages/storybook-web/Makefile
include packages/grpc-bridge/Makefile
