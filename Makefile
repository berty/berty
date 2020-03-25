.PHONY: all
all: generate test

.PHONY: test
test:
	cd go; make test

.PHONY: generate
generate:
	cd go; make generate
	cd js; make gen
	cd docs; make generate

.PHONY: clean
clean:
	cd go; make clean
	cd js; make gen.clean
	cd docs; make clean

.PHONY: docker.build
docker.build:
	cd go; make docker.build

include bazel.make
