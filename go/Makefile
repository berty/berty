##
## Config
##


GO ?= go
GOPATH ?= $(HOME)/go
GO_TEST_OPTS ?= -test.timeout=300s -race -cover -coverprofile=coverage.txt -covermode=atomic
GO_TEST_PATH ?= ./...

BUILD_DATE ?= `date +%s`
VCS_REF ?= `git rev-parse --short HEAD`
VERSION ?= `go run github.com/mdomke/git-semver/v5`
LDFLAGS ?= -ldflags="-X berty.tech/berty/v2/go/pkg/bertyversion.VcsRef=$(VCS_REF) -X berty.tech/berty/v2/go/pkg/bertyversion.Version=$(VERSION)"

##
## General rules
##

all: help
.PHONY: all


help:
	@echo "Available make commands:"
	@cat Makefile | grep '^[a-z]' | grep -v '=' | cut -d: -f1 | sort | sed 's/^/  /'
.PHONY: help


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
	@echo GO111MODULE=on $(GO) install $(LDFLAGS) -v ./cmd/...
	@GO111MODULE=on $(GO) install $(LDFLAGS) -v ./cmd/...
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
protoc_opts := -I ../api:`go list -m -mod=mod -f {{.Dir}} github.com/grpc-ecosystem/grpc-gateway`/third_party/googleapis:`go list -m -mod=mod -f {{.Dir}} github.com/gogo/protobuf`:/protobuf
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
	    bertytech/protoc:27 \
	    -xec 'make generate_local'; \
	  $(MAKE) tidy \
	)
.PHONY: pb.generate


generate_local:
	$(call check-program, shasum protoc)
	$(GO) run github.com/buicongtan1997/protoc-gen-swagger-config -i ../api/messengertypes.proto -o ../api/messengertypes.yaml
	$(GO) run github.com/buicongtan1997/protoc-gen-swagger-config -i ../api/protocoltypes.proto -o ../api/protocoltypes.yaml
	$(GO) run github.com/buicongtan1997/protoc-gen-swagger-config -i ../api/bertyreplication.proto -o ../api/bertyreplication.yaml
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/errcode.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/bertyaccount.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/bertybridge.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/go-internal/testutil.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/go-internal/records.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src ../api/go-internal/handshake.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src --grpc-gateway_out=logtostderr=true,grpc_api_configuration=../api/protocoltypes.yaml:$(GOPATH)/src ../api/protocoltypes.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src --grpc-gateway_out=logtostderr=true,grpc_api_configuration=../api/messengertypes.yaml:$(GOPATH)/src ../api/messengertypes.proto
	protoc $(protoc_opts) --gogo_out=plugins=grpc:$(GOPATH)/src --grpc-gateway_out=logtostderr=true,grpc_api_configuration=../api/bertyreplication.yaml:$(GOPATH)/src ../api/bertyreplication.proto
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./pkg/*/*.pb.go
	sed -i s@berty.tech/berty/go@berty.tech/berty/v2/go@ ./pkg/*/*.pb.gw.go
	$(MAKE) go.fmt
	shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	mv $(gen_sum).tmp $(gen_sum)
.PHONY: generate_local


go.fmt:
	go run github.com/daixiang0/gci -w -local berty.tech .
	go run mvdan.cc/gofumpt -w -s .
.PHONY: go.fmt

pkger.generate:
	$(GO) run github.com/markbates/pkger/cmd/pkger -o go/pkg/assets/
.PHONY: pkger.generate

gen.clean:
	rm -f gen.sum $(wildcard */*/*.pb.go) $(wildcard */*/*pb_test.go) $(wildcard */*/*pb.gw.go)
.PHONY: gen.clean


##
## Doc gen
##


doc.generate: md.generate depaware.generate
.PHONY: doc.generate

md.generate: install
	mkdir -p .tmp

	# generate embeddable outputs
	echo 'foo@bar:~$$ berty -h' > .tmp/berty-usage.txt
	(berty -h || true) 2>> .tmp/berty-usage.txt
	for sub in `berty -h 2>&1 | grep "^  [a-z]" | sed 1d | awk '{print $$1}'`; do \
		echo >> .tmp/berty-usage.txt; \
		echo 'foo@bar:~$$ berty '$$sub' -h' >> .tmp/berty-usage.txt; \
		(berty $$sub -h || true) 2>> .tmp/berty-usage.txt; \
	done

	echo 'foo@bar:~$$ berty share-invite' > .tmp/berty-share-invite.txt
	berty --log.filters="" share-invite -store.inmem -node.display-name=demo >> .tmp/berty-share-invite.txt

	echo 'foo@bar:~$$ berty info' > .tmp/berty-info.txt
	berty --log.filters="" info --info.anonymize -store.inmem >> .tmp/berty-info.txt

	echo 'foo@bar:~$$ berty daemon' > .tmp/berty-daemon.txt
	expect -c "set timeout 10; spawn -noecho docker run bertytech/berty --log.format=console --log.filters=info+:bty daemon -store.inmem; expect serving" >> .tmp/berty-daemon.txt
	echo '...' >> .tmp/berty-daemon.txt

	echo 'foo@bar:~$$ rdvp -h' > .tmp/rdvp-usage.txt
	(rdvp -h || true) 2>> .tmp/rdvp-usage.txt
	for sub in `rdvp -h 2>&1 | grep "^  [a-z]" | sed 1d | awk '{print $$1}'`; do \
		echo >> .tmp/rdvp-usage.txt; \
		echo 'foo@bar:~$$ rdvp '$$sub' -h' >> .tmp/rdvp-usage.txt; \
		(rdvp $$sub -h || true) 2>> .tmp/rdvp-usage.txt; \
	done

	echo 'foo@bar:~$$ betabot -h' > .tmp/betabot-usage.txt
	(betabot -h || true) 2>> .tmp/betabot-usage.txt

	# FIXME: generate output for berty mini

	go run github.com/campoy/embedmd -w README.md
	#rm -rf .tmp
.PHONY: md.generate


##
## depaware
##


depaware.generate: ./cmd/berty/depaware.txt
.PHONY: depaware.generate

depaware_pkgs = ./cmd/berty ./cmd/rdvp ./framework/bertybridge ./cmd/betabot  ./cmd/berty-doctor ./cmd/berty-integration
./cmd/*/depaware.txt: ../go.sum
	@set -xe; for pkg in $(depaware_pkgs); do $(GO) run github.com/tailscale/depaware --update $$pkg; done

depaware.check:
	@set -xe; for pkg in $(depaware_pkgs); do $(GO) run github.com/tailscale/depaware --check $$pkg; done
.PHONY: depaware.check


##
## doctor
##


doctor:
	go run ./cmd/berty-doctor/
.PHONY: doctor


doctor.verbose:
	go run ./cmd/berty-doctor/ -v
.PHONY: doctor.verbose


## integration


integration.dev:
	go run ./cmd/berty-integration
.PHONY: integration.prod


integration.prod:
	go run ./cmd/berty-integration -integration.testbot=`cat ../config/config.gen.json | jq -r '.berty.contacts["testbot"].link'`
.PHONY: integration.prod
