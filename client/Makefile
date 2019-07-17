export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
.DEFAULT_GOAL := all
rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

ROOT := node_modules
ROOT_PRE ?= package.json

LERNA ?= node_modules/.bin/lerna
LERNA_PRE ?= $(ROOT)
LERNA_RUN := $(LERNA) --reject-cycles exec
LERNA_UPDATE := node_modules/.bin/lernaupdate

PACKAGES := $(patsubst \
	%/package.json, \
	%/node_modules, \
	$(shell find packages -type f -name package.json -depth 2 -not -path '*/node_modules/*'))

PACKAGES_PRE = $(LERNA) \

PROTOS = $(strip $(call rwildcard, ../core, *.proto))
OUR_PROTOS = $(filter-out $(call rwildcard,../core/vendor/, *.proto),$(PROTOS))
TEMPLATES := $(shell find packages -type f -name '*.hbs' -not -path '*/node_modules/*')
GENERATE := $(patsubst packages/template/%.hbs,packages/%,$(TEMPLATES)) \
	$(patsubst ../core/%.proto,packages/bridge/service/%.pb.json,$(OUR_PROTOS))

platform ?= web
package ?= app

### ROOT

.PHONY: root
root $(ROOT): $(ROOT_PRE)
	npm $(shell [ ! -z "$$CIRCLE_JOB" ] && echo "ci" || echo "install")

.IGNORE \
.PHONY: root.clean
root.clean:
	rm -rf $(ROOT)

### LERNA

.PHONY: lerna
lerna $(LERNA): $(LERNA_PRE)

.IGNORE \
.PHONY: lerna.clean
lerna.clean: root.clean

### LERNA PACKAGES

.PHONY: packages
packages: $(PACKAGES_PRE) $(PACKAGES)

%/node_modules: %/package.json
	@echo $@
	$(LERNA) --reject-cycles bootstrap $(shell [ ! -z "$$CIRCLE_JOB" ] && echo "--ci")
	# prevent package without dep to rebootstrap
	mkdir -p $(PACKAGES)
	find packages \
		-type d \
		-name 'node_modules' \
		-not -path '*/node_modules/*' \
		-exec touch {}/.updated \;

.IGNORE \
.PHONY: packages.clean
packages.clean:
	$(LERNA_RUN) --scope=@berty/platform -- make clean || (cd packages/platform && make clean)
	$(LERNA) clean -y || rm -rf $(PACKAGES)

.IGNORE \
.PHONY: packages.fclean
packages.fclean:
	$(LERNA_RUN) --scope=@berty/platform -- make fclean || (cd packages/platform && make fclean)
	$(LERNA) clean -y || rm -rf $(PACKAGES)

### Platform

.PHONY: debug
debug: all
	REACT_APP_ENTRYPOINT=@berty/$(package) \
		$(LERNA_RUN) --scope=@berty/platform -- make debug.$(platform)

.PHONY: release
release: all
	REACT_APP_ENTRYPOINT=@berty/$(package) \
		$(LERNA_RUN) --scope=@berty/platform -- make release.$(platform)

.PHONY: publish
publish: all
	#


### UTILS

all: packages generate

help:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  $(HELP_MSG_PREFIX)make /'

.IGNORE \
.PHONY: clean
clean: packages.clean root.clean

.IGNORE \
.PHONY: fclean
fclean: packages.fclean root.clean generate.clean

### COMMANDS
.PHONY: update
update: $(ROOT)
	$(LERNA_UPDATE)

.PHONY: dedup
dedup: $(ROOT)
	$(LERNA_UPDATE) -d

.PHONY: version
version:
	$(LERNA) version \
		--conventional-commmits \
		--no-push \
		--no-git-tag-version \
		--sign-git-commit \
		--sign-git-tag \

.PHONY: pretty
pretty: $(ROOT)
	npm run prettify -- $$(find app -type f -name '*.js' -not -path '*/node_modules/*')

### GENERATE

.PHONY: generate
generate: $(ROOT) $(PACKAGES) $(GENERATE)

packages/bridge/service/%.pb.json: ../core/%.proto
	mkdir -p "$(dir packages/bridge/service/$@)"
	pbjs \
		--path node_modules/@google/protobuf/src \
		--path node_modules/@berty/core/vendor/berty.tech \
		--path node_modules/@berty/core/vendor/github.com/gogo/protobuf \
		--path node_modules/@berty/core/vendor \
		--path node_modules/@berty/core/ \
		-t json \
		$< > $@

packages/%: packages/template/%.hbs
	mkdir -p "$(dir $@)"
	pbhbs \
		--template-dir packages/template \
		--proto-path node_modules/@google/protobuf/src \
		--proto-path node_modules/@berty/core/vendor/berty.tech \
		--proto-path node_modules/@berty/core/vendor/github.com/gogo/protobuf \
		--proto-path node_modules/@berty/core/vendor \
		--proto-path node_modules/@berty/core \
		--output-dir packages \
		--helper-dir packages/template/helper \
		node_modules/@berty/core/api/node/service.proto
	npm run prettify -- $@

.IGNORE \
.PHONY: generate.clean
generate.clean:
	rm -rf $(GENERATE)
