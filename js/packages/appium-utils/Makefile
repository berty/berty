export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

APPIUM_ADDR ?=127.0.0.1
APPIUM_PORT ?=4723

check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "No $(exec) in PATH")))

berty_root ?= $(abspath $(PWD)/../../..)

appium=$(PWD)/node_modules/.bin/appium


.PHONY: start.appium
start.appium: $(PWD)/node_modules
	$(appium) --address $(APPIUM_ADDR) --port $(APPIUM_PORT)

integtest.ios: $(PWD)/node_modules
	cd $(PWD) && $(PWD)/node_modules/.bin/wdio run $(PWD)/wdio.conf.js
