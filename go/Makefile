.PHONY: install
install:
	go install ./cmd/...

.PHONY: test
test: unittest lint tidy

.PHONY: unittest
unittest:
	go test -v -cover -coverprofile=coverage.txt -covermode=atomic -race ./...

.PHONY: lint
lint:
	golangci-lint run --verbose ./...

.PHONY: tidy
tidy:
	go mod tidy

.PHONY: docker.build
docker.build:
	docker build -t bertytech/berty .
