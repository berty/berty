export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_root ?= $(abspath $(PWD)/../../..)

.PHONY: start.grpc-bridge.orbitdb
start.grpc-bridge.orbitdb: export PWD := $(PWD)
start.grpc-bridge.orbitdb:
	cd $(berty_root) && $(MAKE) bazel.generate
	cd $(berty_root) \
		&& bazel run //go/cmd/berty -- --debug demo -l /ip4/192.168.1.36/tcp/1337/grpcws -d '/tmp/berty.demo.db'
