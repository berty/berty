all: generate test
.PHONY: all


test:
	cd go; make test
.PHONY: test


generate:
	touch api/*.proto
	cd go; make generate
	cd js; make generate
	cd docs; make generate
.PHONY: generate


regenerate tidy:
	cd go; make $@
	cd js; make $@
	cd docs; make $@
.PHONY: regenerate tidy


docker.build:
	cd go; make docker.build
.PHONY: docker.build


goreleaser.dry-run:
	goreleaser release --rm-dist --snapshot --skip-publish
.PHONY: goreleaser.dry-run


doctor:
	go run ./tool/doctor/main.go
.PHONY: doctor
