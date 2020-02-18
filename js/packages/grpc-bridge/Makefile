export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_go ?= $(abspath $(PWD)/../../../go)

.PHONY: start.grpc-bridge.orbitdb
start.grpc-bridge.orbitdb: export PWD := $(PWD)
start.grpc-bridge.orbitdb:
	cd $(berty_go) && $(MAKE) bazel.generate
	cd $(berty_go) \
		&& bazel run //cmd/berty -- demo -l /ip4/127.0.0.1/tcp/1337/grpcws -d '/tmp/berty.demo.db'
