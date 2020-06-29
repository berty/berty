.PHONY: all
all: generate test

.PHONY: test
test:
	cd go; make test

.PHONY: generate
generate:
	touch api/*.proto
	cd go; make generate
	cd js; make generate
	cd docs; make generate

.PHONY: regenerate
regenerate:
	cd go; make $@
	cd js; make $@
	cd docs; make $@

.PHONY: docker.build
docker.build:
	cd go; make docker.build

.PHONY: goreleaser.dry-run
goreleaser.dry-run:
	goreleaser release --rm-dist --snapshot --skip-publish
