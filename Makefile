.PHONY: help
help:
	@echo "Global commands:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | grep -v / | sed 's/^/  make /'
	@echo
	@cd core >/dev/null; HELP_MSG_PREFIX="cd core \\&\\& " $(MAKE) help 2>/dev/null
	@echo
	@cd client/react-native >/dev/null; HELP_MSG_PREFIX="cd client\\/react-native \\&\\& " $(MAKE) help 2>/dev/null

.PHONY: lint
lint: lint-go lint-dockerfile lint-editorconfig

.PHONY: lint-dockerfile
lint-dockerfile:
	set -e; for dockerfile in `find . -name "Dockerfile" -or -name "Dockerfile.*"`; do \
		dockerlint -f $$dockerfile; \
	done

.PHONY: lint-go
lint-go:
	golangci-lint run --deadline=5m --verbose  ./core/... ./client/react-native/gomobile/...

.PHONY: lint-editorconfig
lint-editorconfig:
	@FILES=`find . \
		\( \
			-name "*.c" -or \
			-name "*.go" -or \
			-name "*.h" -or \
			-name "*.html" -or \
			-name "*.java" -or \
			-name "*.js" -or \
			-name "*.m" -or \
			-name "*.proto" -or \
			-name "Dockerfile" -or \
			-name "Makefile" \
		\) \
		! -ipath "*/.git/*" \
		! -ipath "*/__generated__/*" \
		! -ipath "*/build/*" \
		! -ipath "*/built/*" \
		! -ipath "*/vendor/*" \
		! -ipath '*/node_modules/*' \
		! -ipath '*/core/pkg/banner/banner.go' \
		! -ipath '*/desktop/output/*' \
		! -ipath '*.chunk.js' \
		! -ipath '*/dist/*' \
		! -ipath '*/precache-manifest.*.js' \
		! -name "*.gen.*" \
		! -name "*.generated.go" \
		! -name "*generated*" \
	`; \
	COUNT=$$(echo "$$FILES" | sed '/^\s*$$/d' | wc -l | tr -d ' '); \
	echo "Checking if $$COUNT files comply with EditorConfig rules..."; \
	eclint check $$FILES


.PHONY: version
version: version.init $(PACKAGES)


.PHONY: _ci_prepare
_ci_prepare:
	cd core && make _ci_prepare

.PHONY: docker.build
docker.build:
	DOCKER_BUILDKIT=1 docker build --progress=plain --ssh default -t bertychat/berty .

.PHONY: docker.push
docker.push: docker.build
	docker push bertychat/berty:latest
