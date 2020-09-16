##
## Config
##


GO ?= go
GOPATH ?= $(HOME)/go
GO_TEST_OPTS ?= -test.timeout=300s -race -cover -coverprofile=coverage.txt -covermode=atomic
GO_TEST_PATH ?= ./...

BUILD_DATE ?= `date +%s`
VCS_REF ?= `git rev-parse --short HEAD`
VERSION ?= `git describe --tags --always`
LDFLAGS ?= -ldflags="-X berty.tech/berty/v2/go/pkg/bertymessenger.VcsRef=$(VCS_REF) -X berty.tech/berty/v2/go/pkg/bertymessenger.Version=$(VERSION)"


##
## General rules
##


test: unittest lint tidy
.PHONY: test


unittest: go.unittest
.PHONY: unittest


generate: pb.generate
.PHONY: generate


regenerate: gen.clean generate
.PHONY: regenerate


install: go.install
.PHONY: install


clean:
	rm -rf out/
.PHONY: clean


mini.dev: generate
	go run github.com/githubnemo/CompileDaemon --color=true --build="go install -v" --build-dir="./cmd/berty" --command="berty mini"
.PHONY: mini.dev


re: clean generate install
.PHONY: re


tidy: go.tidy
.PHONY: tidy


lint: go.lint
.PHONY: lint


##
## Other rules
##


check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "No $(exec) in PATH")))


go.tidy: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) mod tidy
.PHONY: go.tidy


go.lint: pb.generate
	$(call check-program, golangci-lint)
	golangci-lint run --timeout=120s --verbose ./...
.PHONY: go.lint


go.unittest: pb.generate
	$(call check-program, $(GO))
	$(GO_TEST_ENV) GO111MODULE=on $(GO) test $(GO_TEST_OPTS) $(GO_TEST_PATH)
.PHONY: go.unittest


go.unstable-tests: pb.generate
	TEST_STABILITY=unstable go run moul.io/testman test -v -timeout=600s -retry=10 -run ^TestUnstable ./pkg/bertymessenger
	TEST_STABILITY=unstable go run moul.io/testman test -v -test.v -timeout=600s -retry=10 -run ^TestScenario_ ./pkg/bertyprotocol # FIXME: run on other unstable functions too
	# FIXME: run on other packages too
.PHONY: go.unstable-tests


go.broken-tests: pb.generate
	TEST_STABILITY=broken go run moul.io/testman test -continue-on-error -timeout=1200s -test.timeout=60s -retry=5 -run ^TestBroken ./pkg/bertymessenger
	TEST_STABILITY=broken go run moul.io/testman test -continue-on-error -timeout=1200s -test.timeout=60s -retry=5 -run ^TestScenario_ ./pkg/bertyprotocol
.PHONY: go.broken-tests


go.install: pb.generate
	$(call check-program, $(GO))
	GO111MODULE=on $(GO) install $(LDFLAGS) -v ./cmd/...
.PHONY: go.install


docker.build: pb.generate
	$(call check-program, docker)
	docker build -t bertytech/berty ..
.PHONY: docker.build


docker.fast: pb.generate
	$(call check-program, $(GO) docker)
	@mkdir -p out
	GOOS=linux GOARCH=amd64 GO111MODULE=on $(GO) build -v -o ./out/berty-linux-static ./cmd/berty
	docker run -it --rm -v $(PWD)/out/berty-linux-static:/bin/berty $(RUN_OPTS) ubuntu berty $(ARGS)
.PHONY: docker.fast


print-%:
	@echo $* = $($*)


minimum_go_minor_version = 14
validate-go-version:
	@if [ ! "x`$(GO) version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f1`" = "x1" ]; then \
		echo "error: Golang version should be \"1.x\". Please use 1.$(minimum_go_minor_version) or more recent."; \
		exit 1; \
	fi
	@if [ `$(GO) version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f2` -lt $(minimum_go_minor_version) ]; then \
		echo "error: Golang version is not supported. Please use 1.$(minimum_go_minor_version) or more recent."; \
		exit 1; \
	fi
.PHONY: validate-go-version


##
## Code gen
##


protos_src := $(wildcard ../api/*.proto) $(wildcard ../api/go-internal/*.proto)
gen_src := $(protos_src) Makefile
gen_sum := gen.sum
protoc_opts := -I ../api:`go list -m -f {{.Dir}} github.com/grpc-ecosystem/grpc-gateway`/third_party/googleapis:`go list -m -f {{.Dir}} github.com/gogo/protobuf`:/protobuf
pb.generate: gen.sum validate-go-version
$(gen_sum): $(gen_src)
	$(call check-program, shasum docker $(GO))
	@shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	@diff -q $(gen_sum).tmp $(gen_sum) || ( \
	  uid=`id -u`; \
	  set -xe; \
	  $(GO) mod download; \
	  docker run \
	    --user="$$uid" \
	    --volume="`go env GOPATH`/pkg/mod:/go/pkg/mod" \
	    --volume="$(PWD)/..:/go/src/berty.tech/berty" \
	    --workdir="/go/src/berty.tech/berty/go" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:25 \
	    -xec 'make generate_local'; \
	    $(MAKE) tidy \
	)
.PHONY: pb.generate


generate_local:
	$(call check-program, shasum protoc)
	go run github.com/buicongtan1997/protoc-gen-swagger-config -i ../api/bertymessenger.proto -o ../api/bertymessenger.yaml
	go run github.com/buicongtan1997/protoc-gen-swagger-config -i ../api/bertyprotocol.proto -o ../api/bertyprotocol.yaml
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/errcode.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/bertybridge.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/bertytypes.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/go-internal/records.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/go-internal/handshake.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src --grpc-gateway_out=logtostderr=true,grpc_api_configuration=../api/bertyprotocol.yaml:$(GOPATH)/src ../api/bertyprotocol.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src --grpc-gateway_out=logtostderr=true,grpc_api_configuration=../api/bertymessenger.yaml:$(GOPATH)/src ../api/bertymessenger.proto
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./framework/bertybridge/internal/bridgepb/*.pb.go
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./pkg/*/*.pb.go
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./pkg/*/*.pb.gw.go
	go run golang.org/x/tools/cmd/goimports -w ./pkg ./cmd ./internal
	shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	mv $(gen_sum).tmp $(gen_sum)
.PHONY: generate_local


gen.clean:
	rm -f gen.sum $(wildcard */*/*.pb.go) $(wildcard */*/*pb_test.go) $(wildcard */*/*pb.gw.go)
.PHONY: gen.clean


##
## Doc gen
##


doc.generate: install
	mkdir -p .tmp
	GO111MODULE=off go get github.com/campoy/embedmd

	# generate usage.txt
	echo 'foo@bar:~$$ berty -h' > .tmp/usage.txt
	(berty -h || true) 2>> .tmp/usage.txt
	for sub in `berty -h 2>&1 | grep "^  [a-z]" | sed 1d | awk '{print $$1}'`; do \
		echo >> .tmp/usage.txt; \
		echo 'foo@bar:~$$ berty '$$sub' -h' >> .tmp/usage.txt; \
		(OBberty $$sub -h || true) 2>> .tmp/usage.txt; \
	done

	echo 'foo@bar:~$$ berty share-invite' > .tmp/share-invite.txt
	berty --log.filters="" share-invite -store.inmem -node.display-name=demo >> .tmp/share-invite.txt

	echo 'foo@bar:~$$ berty info' > .tmp/info.txt
	berty --log.filters="" info -store.inmem >> .tmp/info.txt

	echo 'foo@bar:~$$ berty daemon' > .tmp/daemon.txt
	expect -c "set timeout 10; spawn -noecho docker run bertytech/berty --log.format=console --log.filters=info+:bty daemon -store.inmem; expect serving" >> .tmp/daemon.txt
	echo '...' >> .tmp/daemon.txt

	# FIXME: generate output for berty mini

	embedmd -w README.md
	#rm -rf .tmp
.PHONY: doc.generate
