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
	golangci-lint run --verbose  ./...

.PHONY: lint-editorconfig
lint-editorconfig:
	@FILES=`find . -type f \
		! -name '*.gen.go' \
		! -name '*.gen.go.tmpl' \
		! -name '*.gen.graphql' \
		! -name '*.generated.go' \
		! -name '*.patch' \
		! -name '*.diff' \
		! -name '*.vim' \
		! -name '*.bat' \
		! -name '.DS_Store' \
		! -name '.generated' \
		! -name '.gitkeep' \
		! -name 'Gemfile.lock' \
		! -name 'Gopkg*' \
		! -name 'LICENSE' \
		! -name 'README.md' \
		! -name 'go.mod' \
		! -name 'go.sum' \
		! -name 'yarn-error.log' \
		! -name 'yarn.lock' \
		! -path '*/__generated__/*' \
		! -path '*/generated/*' \
		! -path '*/node_modules/*' \
		! -path './.git/*' \
		! -path './.github/*' \
		! -path './client/common/openssl/built/*' \
		! -path './client/react-native/common/schema.graphql' \
		! -path './client/react-native/*/Build/*' \
		! -path './client/react-native/*/build/*' \
		! -path './client/react-native/android/.idea/*' \
		! -path './client/react-native/android/.gradle/*' \
		! -path './client/react-native/ios/Berty.xcodeproj/*' \
		! -path './client/react-native/ios/Berty/Images.xcassets/*' \
		! -path './client/react-native/ios/core.framework/*' \
		! -path './vendor/*' \
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
	docker build -t bertychat/berty .
