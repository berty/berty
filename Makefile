all: generate test
.PHONY: all


test:
	cd go; $(MAKE) test
	cd js; $(MAKE) test
	cd js; $(MAKE) lint
.PHONY: test


generate:
	touch api/*.proto
	cd go; $(MAKE) generate
	cd docs; $(MAKE) generate
	cd js; $(MAKE) generate
	cd config; $(MAKE) generate
	go mod tidy
.PHONY: generate


regenerate:
	touch api/*.proto
	cd go; $(MAKE) regenerate
	cd docs; $(MAKE) regenerate
	cd js; $(MAKE) regenerate
	cd config; $(MAKE) generate
	go mod tidy
.PHONY: regenerate


tidy:
	go mod tidy
	cd js; go mod tidy
	cd tool; go mod tidy
	cd tool/tyber/go; go mod tidy
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


clean:
	-cd tool/berty-mini-local-helper; $(MAKE) clean
	-cd tool/tyber; $(MAKE) clean
	-cd tool/deployments/welcomebot; $(MAKE) clean
	-cd tool/deployments/testbot; $(MAKE) clean
	-cd go; $(MAKE) clean
	-cd docs; $(MAKE) clean
	-cd js; $(MAKE) clean
.PHONY: clean
