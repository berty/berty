##
## Config
##

GO ?= go
GOPATH ?= $(HOME)/go
GO_TEST_OPTS ?= -test.timeout=300s -race -cover -coverprofile=coverage.txt -covermode=atomic
GO_TEST_PATH ?= ./...
PROTOC_OPTS ?= -I ../vendor/github.com/grpc-ecosystem/grpc-gateway:../api:../vendor:/protobuf

BUILD_DATE ?= `date +%s`
VCS_REF ?= `git rev-parse --short HEAD`
VERSION ?= `git describe --tags --always`
LDFLAGS ?= -ldflags="-X berty.tech/berty/v2/go/pkg/bertymessenger.VcsRef=$(VCS_REF) -X berty.tech/berty/v2/go/pkg/bertymessenger.Version=$(VERSION) -X berty.tech/berty/v2/go/pkg/bertymessenger.BuildTime=$(BUILD_DATE)"

##
## General rules
##

.PHONY: test
test: unittest lint tidy

.PHONY: unittest
unittest: go.unittest

.PHONY: generate
generate: pb.generate

.PHONY: regenerate
regenerate: gen.clean generate

.PHONY: install
install: go.install

.PHONY: clean
clean:
	rm -rf vendor/ out/

.PHONY: re
re: clean generate install

.PHONY: tidy
tidy: go.tidy

.PHONY: lint
lint: go.lint

##
## Other rules
##

check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "No $(exec) in PATH")))

.PHONY: go.tidy
go.tidy: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) mod tidy

.PHONY: go.lint
go.lint: pb.generate
	$(call check-program, golangci-lint)
	golangci-lint run --timeout=120s --verbose ./...

.PHONY: go.unittest
go.unittest: pb.generate
	$(call check-program, $(GO))
	$(GO_TEST_ENV) GO111MODULE=on $(GO) test $(GO_TEST_OPTS) $(GO_TEST_PATH)

.PHONY: go.install
go.install: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) install $(LDFLAGS) -v ./cmd/...

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

protos_src := $(wildcard ../api/*.proto) $(wildcard ../api/go-internal/*.proto)
gen_src := $(protos_src) Makefile
gen_sum := gen.sum

.PHONY: gen.clean
gen.clean:
	rm -f gen.sum $(wildcard */*/*.pb.go) $(wildcard */*/*pb_test.go) $(wildcard */*/*pb.gw.go)

.PHONY: pb.generate
pb.generate: gen.sum
$(gen_sum): $(gen_src)
	$(call check-program, shasum docker $(GO))
	@shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	@diff -q $(gen_sum).tmp $(gen_sum) || ( \
	  uid=`id -u`; \
	  set -xe; \
	  $(GO) mod vendor; \
	  docker run \
	    --user="$$uid" \
	    --volume="$(PWD)/..:/go/src/berty.tech/berty" \
	    --workdir="/go/src/berty.tech/berty/go" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:24 \
	    -xec 'make generate_local'; \
	    $(MAKE) tidy \
	)

.PHONY: generate_local
generate_local:
	$(call check-program, goimports shasum protoc)
	@set -e; for proto in $(protos_src); do ( set -xe; \
	  protoc $(PROTOC_OPTS) \
		--gogo_out="plugins=grpc:$(GOPATH)/src" "$$proto" \
		--grpc-gateway_out="logtostderr=true:$(GOPATH)/src" \
	); done

	@### custom
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./pkg/*/*.pb.go
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./pkg/*/*.pb.gw.go
	@### end of custom

	goimports -w ./pkg ./cmd ./internal
	shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	mv $(gen_sum).tmp $(gen_sum)

##
## Dev
##

print-%:
	@echo $* = $($*)
