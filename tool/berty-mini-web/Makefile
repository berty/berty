PORT ?= 7681
UNAME_S := $(shell uname -s)
OPTS ?=

.PHONY: run
run:
	ttyd -p $(PORT) --url-arg $(OPTS) ./berty-mini

.PHONY: deps
deps:
ifeq ($(UNAME_S),Linux)
	sudo apt install build-essential cmake git libjson-c-dev libwebsockets-dev
	if [ ! -d .tmp/ttyd ]; then mkdir -p .tmp && cd .tmp && git clone https://github.com/tsl0922/ttyd.git; fi
	cd .tmp/ttyd && mkdir -p build
	cd .tmp/ttyd/build && cmake ..
	cd .tmp/ttyd/build && make
	cd .tmp/ttyd/build && sudo make install
endif
ifeq ($(UNAME_S),Darwin)
	brew install ttyd
endif
