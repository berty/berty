all: generate test
.PHONY: all


test:
	cd go; $(MAKE) test
.PHONY: test


generate:
	touch api/*.proto
	cd config; $(MAKE) generate
	cd go; $(MAKE) generate
	cd docs; $(MAKE) generate
	cd js; $(MAKE) generate
.PHONY: generate


regenerate tidy:
	go mod tidy
	cd js; go mod tidy
	cd tool; go mod tidy
.PHONY: regenerate tidy


docker.build:
	cd go; $(MAKE) docker.build
.PHONY: docker.build


goreleaser.dry-run:
	goreleaser release --rm-dist --snapshot --skip-publish
.PHONY: goreleaser.dry-run


doctor:
	go run ./tool/doctor/main.go
.PHONY: doctor
