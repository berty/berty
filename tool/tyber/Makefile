check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "Missing deps: no '$(exec)' in PATH")))
rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
makefile_dir=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
app_name=Tyber
go_dir=$(makefile_dir)/go
go_src=$(filter-out $(wildcard $(go_dir)/bind/*),$(call rwildcard,$(go_dir),*.go)) $(go_dir)/go.mod $(go_dir)/go.sum
bundler=github.com/asticode/go-astilectron-bundler/astilectron-bundler
bundler_cfg=$(go_dir)/bundler/bundler.json
bundler_resources=$(go_dir)/bundler/resources/app
js_dir=$(makefile_dir)/js
js_src=$(call rwildcard,$(js_dir)/app,*) $(call rwildcard,$(js_dir)/assets,*)
js_build=$(js_dir)/web-build
node_modules=$(js_dir)/node_modules
output_dir=$(makefile_dir)/output
darwin_output=$(output_dir)/darwin-amd64/$(app_name).app
linux_output=$(output_dir)/linux-amd64/$(app_name)
windows_output=$(output_dir)/windows-amd64/$(app_name).exe

.PHONY: help
help:
	@echo "$$(tput bold)"
	@echo "  Command              Description                                   "
	@echo "$$(tput sgr0)"
	@echo "  run                  Build and run $(app_name) on current machine  "
	@echo "  run.web              Run $(app_name) web UI only in a web browser  "
	@echo "  build                Build $(app_name) for macOS, Linux and Windows"
	@echo "  build.darwin         Build $(app_name) for macOS                   "
	@echo "  build.linux          Build $(app_name) for Linux                   "
	@echo "  build.windows        Build $(app_name) for Windows                 "
	@echo "  clean                Clean cache and built files                   "

.PHONY: run
run:
ifeq ($(OS),Windows_NT)
	$(MAKE) build.windows
	$(windows_output)
else ifeq ($(shell uname),Linux)
	$(MAKE) build.linux
	$(linux_output)
else ifeq ($(shell uname),Darwin)
	$(MAKE) build.darwin
	open $(darwin_output)
else
	$(error "Current OS is not compatible with $(app_name)")
endif

.PHONY: run.web
run.web: $(node_modules)
	@echo "$$(tput smul)$$(tput setaf 1)Warning: this will only run web UI without Go backend$$(tput sgr0)\n"
	cd $(js_dir) && yarn web

.PHONY: build
build: build.darwin build.linux build.windows

.PHONY: build.darwin
build.darwin: $(darwin_output)

.PHONY: build.linux
build.linux: $(linux_output)

.PHONY: build.windows
build.windows: $(windows_output)

.PHONY: clean
clean:
	rm -rf $(output_dir)
	rm -rf $(bundler_resources)
	rm -rf $(js_build)
	rm -rf $(node_modules)
	rm -rf $(go_dir)/bind
	cd $(go_dir) && go run $(bundler) cc -c $(bundler_cfg)

$(darwin_output): $(bundler_resources) $(go_src) $(bundler_cfg)
	$(call check-program, go)
	cd $(go_dir) && go mod download
	cd $(go_dir) && go run $(bundler) -c $(bundler_cfg) -d

$(linux_output): $(bundler_resources) $(go_src) $(bundler_cfg)
	$(call check-program, go)
	cd $(go_dir) && go mod download
	cd $(go_dir) && go run $(bundler) -c $(bundler_cfg) -l

$(windows_output): $(bundler_resources) $(go_src) $(bundler_cfg)
	$(call check-program, go)
	cd $(go_dir) && go mod download
	cd $(go_dir) && go run $(bundler) -c $(bundler_cfg) -w

$(bundler_resources): $(js_build)
	rm -rf $(bundler_resources)
	cp -rf $(js_build) $(bundler_resources)
	touch $@

$(js_build): $(node_modules) $(js_src)
	$(call check-program, yarn)
	cd $(js_dir) && yarn build
	touch $@

$(node_modules): $(js_dir)/package.json
	$(call check-program, yarn)
	cd $(js_dir) && yarn
	touch $@


# go types to ts types

# TODO: gen.sum for CI
generate:
	cd go && go run ./gen > ../js/app/types/goTypes.ts
.PHONY: generate
	