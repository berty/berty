.PHONY: help
help:
	@echo "Available commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | sed 's/^/  make /'
	@echo
	@echo "Core commands (cd core):"
	@cd core >/dev/null; $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  cd core; make /'

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
