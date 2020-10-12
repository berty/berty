all: generate test
.PHONY: all


test:
	cd go; make test
.PHONY: test


generate:
	touch api/*.proto
	cd config; make generate
	cd go; make generate
	cd docs; make generate
	cd js; make generate
.PHONY: generate


regenerate tidy:
	go mod tidy
	cd js; go mod tidy
	cd tool; go mod tidy
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
