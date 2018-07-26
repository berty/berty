.PHONY: lint
lint: lint-go

.PHONY: lint-go
lint-go:
	gometalinter.v2 ./...
