all: generate test
.PHONY: all


test:
	cd go; $(MAKE) test
.PHONY: test


generate:
	touch api/*.proto
	cd go; $(MAKE) generate
	cd docs; $(MAKE) generate
	cd js; $(MAKE) generate
	cd config; $(MAKE) generate
.PHONY: generate


tidy:
	go mod tidy
	cd js; go mod tidy
	cd tool; go mod tidy
.PHONY: tidy


docker.build:
	cd go; $(MAKE) docker.build
.PHONY: docker.build


goreleaser.dry-run:
	goreleaser release --rm-dist --snapshot --skip-publish
.PHONY: goreleaser.dry-run

doctor:
	cd go && $(MAKE) doctor
.PHONY: doctor

doctor.verbose:
	cd go && $(MAKE) doctor.verbose
.PHONY: doctor.verbose
