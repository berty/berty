.PHONY: lint
lint: lint-go lint-dockerfile

.PHONY: lint-dockerfile
lint-dockerfile:
	set -e; for dockerfile in `find . -name "Dockerfile" -or -name "Dockerfile.*"`; do \
	  dockerlint -f $$dockerfile; \
	done

.PHONY: lint-go
lint-go:
	gometalinter.v2 ./...

.PHONY: _ci_prepare
_ci_prepare:
	cd core && make _ci_prepare
