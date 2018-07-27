PWD := $(shell pwd)

CORE_PACKAGE := $(PWD)/../../../core

IOS_OUTPUT     := $(PWD)/../mobile/ios
ANDROID_OUTPUT := $(PWD)/../mobile/android/app/libs

ANDROID_NDK_HOME ?= /usr/local/share/android-ndk/

GOTEST_TIMEOUT ?= 30s

deps-osx:
	brew cask install android-sdk android-ndk

deps:
	go get -v golang.org/x/mobile/cmd/gomobile
	go get -v golang.org/x/mobile/cmd/gobind

init: deps
	gomobile init -v -ndk $(ANDROID_NDK_HOME)

core.build.ios:
	mkdir -p $(IOS_OUTPUT)
	gomobile bind -v -target=ios -o $(IOS_OUTPUT)/core.framework .

core.build.android:
	mkdir -p $(ANDROID_OUTPUT)
	gomobile bind -v -target=android -o $(ANDROID_OUTPUT)/core.aar .

.PHONY: test
test:
	go test -test.timeout $(GOTEST_TIMEOUT) -v ./...

core.build: core.build.ios core.build.android
build: core.build
