export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

BUILD_MODE ?= dev

GIT_SHA ?= $(shell git rev-parse HEAD)
GIT_TAG ?= $(shell git describe --tags --always)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT_DATE ?= $(shell git show -s --format=%ct $(GIT_SHA))

.PHONY: deps
deps:
	GO111MODULE=on go mod vendor
	GO111MODULE=off go get -u github.com/asticode/go-astilectron-bundler/...
	GO111MODULE=off go install github.com/asticode/go-astilectron-bundler/astilectron-bundler

.PHONY: build
build: clean deps
	GO111MODULE=on go mod vendor
	sed s%TMPL_MAKEFILE_PATH%$(PWD)%g bundler.json.tmpl > bundler.json
	cp -rf $(PWD)/../../../client/web/build $(PWD)/resources/app
	GO111MODULE=on astilectron-bundler -ldflags X:berty.tech/core.GitSha=$(GIT_SHA),berty.tech/core.GitTag=$(GIT_TAG),berty.tech/core.GitBranch=$(GIT_BRANCH),berty.tech/core.BuildMode=$(BUILD_MODE),berty.tech/core.commitDate=$(GIT_COMMIT_DATE)

.PHONY: sign
sign: /usr/local/bin/dylibbundler
ifndef CSC_LINK
	$(error CSC_LINK is undefined)
endif
ifndef CSC_KEY_PASSWORD
	$(error CSC_KEY_PASSWORD is undefined)
endif
	dylibbundler \
		-od \
		-b \
		-x $(PWD)/output/darwin-amd64/Berty.app/Contents/MacOS/berty \
		-d $(PWD)/output/darwin-amd64/Berty.app/Contents/libs

/usr/local/bin/dylibbundler:
	brew install dylibbundler

.PHONY: clean
clean:
	rm -rf $(PWD)/resources/app $(PWD)/output/ $(PWD)/bind_*.go $(PWD)/bundler.json

.PHONY: re
re: clean build
