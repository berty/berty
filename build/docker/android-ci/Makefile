MAKEFILE_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
IMAGE ?= bertytech/android-ci:v6

build:
	cp $(MAKEFILE_DIR)/../patch/gomobile-env-flag.diff .
	docker build --pull -t $(IMAGE) $(MAKEFILE_DIR)

release: build
	docker push $(IMAGE)
