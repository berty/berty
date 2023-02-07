check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))

all: generate test
.PHONY: all


test:
	cd go; $(MAKE) test
	cd js; $(MAKE) test
	cd js; $(MAKE) lint
.PHONY: test


generate:
	$(call check-program, go)
	$(shell find ../api -type f -name '*.proto' -exec touch {} \;) # touch all proto files to force regeneration
	cd go; $(MAKE) generate
	cd docs; $(MAKE) generate
	cd js; $(MAKE) generate
	cd config; $(MAKE) generate
	go mod tidy
.PHONY: generate


regenerate:
	$(call check-program, go)
	$(shell find ../api -type f -name '*.proto' -exec touch {} \;) # touch all proto files to force regeneration
	cd go; $(MAKE) regenerate
	cd docs; $(MAKE) regenerate
	cd js; $(MAKE) regenerate
	cd config; $(MAKE) generate
	go mod tidy
.PHONY: regenerate


tidy:
	$(call check-program, go)
	go mod tidy
	cd js; go mod tidy
	cd tool; go mod tidy
	cd tool/tyber/go; go mod tidy
.PHONY: tidy


docker.build:
	cd go; $(MAKE) docker.build
.PHONY: docker.build


goreleaser.dry-run:
	$(call check-program, goreleaser)
	goreleaser release --rm-dist --snapshot --skip-publish
.PHONY: goreleaser.dry-run

doctor:
	cd go && $(MAKE) doctor
.PHONY: doctor

doctor.verbose:
	cd go && $(MAKE) doctor.verbose
.PHONY: doctor.verbose


clean:
	-cd tool/berty-mini-local-helper; $(MAKE) clean
	-cd tool/tyber; $(MAKE) clean
	-cd tool/deployments/welcomebot; $(MAKE) clean
	-cd tool/deployments/testbot; $(MAKE) clean
	-cd go; $(MAKE) clean
	-cd docs; $(MAKE) clean
	-cd js; $(MAKE) clean
.PHONY: clean


asdf.install_plugins:
	$(call check-program, asdf)
	@echo "Installing asdf plugins..."
	@set -e; \
	for PLUGIN in $$(cut -d' ' -f1 .tool-versions | grep "^[^\#]"); do \
		asdf plugin add $$PLUGIN || [ $$? == 2 ] || exit 1; \
	done

asdf.install_tools: asdf.install_plugins
	$(call check-program, asdf)
	@echo "Installing asdf tools..."
	@asdf install
