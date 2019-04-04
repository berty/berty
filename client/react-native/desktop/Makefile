MAKEFILE_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

deps:
	GOPROXY=https://goproxy.berty.io GO111MODULE=on go mod vendor
	GO111MODULE=off go get -u github.com/asticode/go-astilectron-bundler/...
	GO111MODULE=off go install github.com/asticode/go-astilectron-bundler/astilectron-bundler

build: clean
	GOPROXY=https://goproxy.berty.io GO111MODULE=on go mod vendor
	sed s%TMPL_MAKEFILE_PATH%$(MAKEFILE_DIR)%g bundler.json.tmpl > bundler.json
	cp -rf $(MAKEFILE_DIR)/../web/build $(MAKEFILE_DIR)/../desktop/resources/app
	GOCACHE=/tmp/gocache astilectron-bundler -v

sign:
ifndef CSC_LINK
	$(error CSC_LINK is undefined)
endif
ifndef CSC_KEY_PASSWORD
	$(error CSC_KEY_PASSWORD is undefined)
endif
	cp -rf $(MAKEFILE_DIR)/output/darwin-amd64/Berty.app $(MAKEFILE_DIR)/appdmg
	dylibbundler -od -b -x $(MAKEFILE_DIR)/appdmg/Berty.app/Contents/MacOS/berty -d $(MAKEFILE_DIR)/appdmg/Berty.app/Contents/libs/
	cd $(MAKEFILE_DIR)/appdmg && electron-builder build --publish never --prepackaged Berty.app

clean:
	rm -rf $(MAKEFILE_DIR)/resources/app $(MAKEFILE_DIR)/output/ $(MAKEFILE_DIR)/bind_*.go $(MAKEFILE_DIR)/bundler.json

re: clean deps build
