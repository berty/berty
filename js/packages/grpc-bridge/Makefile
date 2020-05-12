export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_root ?= $(abspath $(PWD)/../../..)

.PHONY: start.grpc-bridge.orbitdb
start.grpc-bridge.orbitdb: export PWD := $(PWD)
start.grpc-bridge.orbitdb: host ?= 127.0.0.1
start.grpc-bridge.orbitdb:
	cd $(berty_root) && $(MAKE) bazel.generate
	cd $(berty_root) \
		&& bazel run //go/cmd/berty -- demo -l /ip4/$(host)/tcp/1337/grpcws -d '/tmp/berty.demo.db'

.PHONY: start.grpc-bridge.berty
start.grpc-bridge.berty: export PWD := $(PWD)
start.grpc-bridge.berty: host ?= 127.0.0.1
start.grpc-bridge.berty: port ?= 1337
start.grpc-bridge.berty: proto ?= grpcws
start.grpc-bridge.berty:
	cd $(berty_root) && $(MAKE) bazel.generate
	cd $(berty_root) \
		&& bazel run //go/cmd/berty -- daemon -l /ip4/$(host)/tcp/$(port)/$(proto)
