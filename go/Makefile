##
## Config
##

GO ?= go
GO_TEST_OPTS ?= -test.timeout=180s
GOPATH ?= $(HOME)/go

##
## Functions
##

check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "No $(exec) in PATH")))

##
## General rules
##

.PHONY: build
build:
	$(MAKE) -C .. bazel.build

.PHONY: run
run:
	$(MAKE) -C .. bazel.daemon

.PHONY: dev
dev:
	$(MAKE) -C .. ibazel.daemon

.PHONY: autotest
autotest:
	$(MAKE) -C .. ibazel.unittest

.PHONY: unittest
unittest: go.unittest

.PHONY: generate
generate: pb.generate

.PHONY: install
install: go.install

.PHONY: clean
clean: pb.clean
	rm -rf vendor/ out/
	$(MAKE) -C .. bazel.clean

.PHONY: fclean
fclean: clean
	$(MAKE) -C .. bazel.fclean

.PHONY: re
re: clean build


##
## Go rules
##

.PHONY: go.lint
go.lint: pb.generate
	$(call check-program, golangci-lint)
	golangci-lint run --timeout=120s --verbose ./...

.PHONY: go.unittest
go.unittest: GO_TEST_PATH ?= ./...
go.unittest: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) test $(GO_TEST_OPTS) -cover -coverprofile=coverage.txt -covermode=atomic -race $(GO_TEST_PATH)

.PHONY: go.unittest.watch
go.unittest: GO_TEST_PATH ?= ./...
go.unittest.watch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	while true; \
		do clear; \
		GO_TEST_PATH=$(GO_TEST_PATH) make go.unittest; \
		watchman-wait . -p "**/*.go"; \
	done

.PHONY: go.install
go.install: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) install -v ./cmd/...

.PHONY: test
test: unittest lint tidy

.PHONY: lint
lint: go.lint

.PHONY: tidy
tidy: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) mod tidy

.PHONY: docker.build
docker.build: pb.generate
	$(call check-program, docker)
	docker build -t bertytech/berty ..

.PHONY: docker.fast
docker.fast: args ?= -h
docker.fast: run_opts ?=
docker.fast: pb.generate
	$(call check-program, $(GO) docker)
	@mkdir -p out
	GOOS=linux GOARCH=amd64 GO111MODULE=on $(GO) build -v -o ./out/berty-linux-static ./cmd/berty
	docker run -it --rm -v $(PWD)/out/berty-linux-static:/bin/berty $(run_opts) ubuntu berty $(args)

##
## Code gen
##

PROTOS_SRC := $(wildcard ../api/*.proto) $(wildcard ../api/go-internal/*.proto)
GEN_SRC := $(PROTOS_SRC) Makefile
GEN_SUM := gen.sum

.PHONY: pb.clean
pb.clean:
	rm -f gen.sum $(wildcard */*/*.pb.go) $(wildcard */*/*pb_test.go)

.PHONY: pb.generate
pb.generate: gen.sum
$(GEN_SUM): $(GEN_SRC)
	$(call check-program, shasum docker $(GO))
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	@diff -q $(GEN_SUM).tmp $(GEN_SUM) || ( \
	  uid=`id -u`; \
	  set -xe; \
	  $(GO) mod vendor; \
	  docker run \
	    --user="$$uid" \
	    --volume="$(PWD)/..:/go/src/berty.tech/berty" \
	    --workdir="/go/src/berty.tech/berty/go" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:22 \
	    -xec 'make generate_local'; \
	    $(MAKE) tidy \
	)

PROTOC_OPTS = -I ../vendor/github.com/grpc-ecosystem/grpc-gateway:../api:../vendor:/protobuf
.PHONY: generate_local
generate_local:
	$(call check-program, goimports shasum protoc)
	@set -e; for proto in $(PROTOS_SRC); do ( set -xe; \
	  protoc $(PROTOC_OPTS) --gogo_out="plugins=grpc:$(GOPATH)/src" "$$proto" \
	); done
	@### custom
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./pkg/*/*.pb.go
	@### end of custom
	goimports -w ./pkg ./cmd ./internal
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	mv $(GEN_SUM).tmp $(GEN_SUM)

##
## Dev
##

print-%:
	@echo $*: $($*)
