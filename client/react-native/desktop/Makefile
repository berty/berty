MAKEFILE_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

deps:
	GOPROXY=https://goproxy.berty.io GO111MODULE=on go mod vendor
	GO111MODULE=off go get -u github.com/asticode/go-astilectron-bundler/...

build: clean
	GOPROXY=https://goproxy.berty.io GO111MODULE=on go mod vendor
	sed s%TMPL_MAKEFILE_PATH%$(MAKEFILE_DIR)%g bundler.json.tmpl > bundler.json
	cp -rf $(MAKEFILE_DIR)/../web/build $(MAKEFILE_DIR)/../desktop/resources/app
	GOCACHE=/tmp/gocache astilectron-bundler -v

clean:
	rm -rf $(MAKEFILE_DIR)/resources/app $(MAKEFILE_DIR)/output/ $(MAKEFILE_DIR)/bind_*.go $(MAKEFILE_DIR)/bundler.json

re: clean deps build
