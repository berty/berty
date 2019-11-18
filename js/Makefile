export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

YARN_INSTALL_OPTS ?=

author = Berty Technologies <oss@berty.tech>
contributor = $(shell git config --get user.name) <$(shell git config --get user.email)>
license = (Apache-2.0 or MIT)

go := $(abspath $(PWD)/../go)
go_vendor := $(go)/vendor
bin := $(PWD)/node_modules/.bin
pkg := $(sort $(dir $(wildcard $(PWD)/packages/*/)))
node_modules_dirs := $(PWD)/node_modules $(patsubst %, %/node_modules, $(pkg))
package_json_files := $(PWD)/package.json $(patsubst %, %/package.json, $(pkg))

lerna := $(bin)/lerna
lerna_flags := --reject-cycles --concurrency=8
lerna_upgrade := $(bin)/upd
lerna_exec := $(lerna) $(lerna_flags) exec --stream --parallel --scope=$1 --
yarn := $(shell which yarn || echo '/usr/local/bin/yarn')
json := $(bin)/json
caser := $(bin)/caser
eslint := $(bin)/eslint

.DEFAULT_GOAL := deps

.PHONY: deps
deps: $(go_vendor) $(yarn) $(lerna) $(node_modules_dirs) $(package_json_files)

print-%  : ; @echo $* = $($*)

.PHONY: env
env:
	@env

$(yarn):
	$(error "yarn is not installed")

$(go_vendor):
	cd $(berty_go_path) && make vendor

$(node_modules_dirs): $(yarn) $(package_json_files)
	$(yarn) $(YARN_INSTALL_OPTS)
	$(lerna) $(lerna_flags) bootstrap
	mkdir -p $(all_node_modules)
	touch $(all_node_modules)

.PHONY: upgrade
upgrade: deps
	$(lerna_upgrade)

.PHONY: clean
clean: $(yarn)
	rm -rf $(node_modules_dir)
	$(yarn) cache clean -f

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

include packages/berty-store/Makefile
include packages/berty-templates/Makefile
include packages/berty-api/Makefile
include packages/react-native-chat-sdk/Makefile
include packages/berty-app/Makefile
include packages/storybook-mobile/Makefile
include packages/storybook-web/Makefile
include packages/react-native-core/Makefile
