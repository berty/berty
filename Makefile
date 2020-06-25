.PHONY: all
all: generate test

.PHONY: test
test:
	cd go; make test

.PHONY: generate
generate:
	cd go; make generate
	cd js; make generate
	cd docs; make generate

.PHONY: gen.clean
gen.clean:
	cd go; make clean
	cd js; make gen.clean
	cd docs; make clean

.PHONY: docker.build
docker.build:
	cd go; make docker.build

include bazel.make

.PHONY: goreleaser.dry-run
goreleaser.dry-run:
	goreleaser release --rm-dist --snapshot --skip-publish
