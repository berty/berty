# Packer parameters
AWS_REGION        ?= eu-west-3
GITHUB_REMOTE     ?= berty
GITHUB_BRANCH     ?= master
SERVER_GO_VERSION ?= 1.17.6

# Internal
MAKEFILE_DIR        = $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
PACKER_DIR          = $(MAKEFILE_DIR)/packer
INSTALL_DIR         = $(shell go env GOPATH)/bin
GO_DIR              = $(MAKEFILE_DIR)/go
GO_SERVER_DIR       = $(GO_DIR)/server
CLIENT_NAME         = berty-infra-client
SERVER_NAME         = berty-infra-server
CLIENT_OUTPUT_PATH  = $(MAKEFILE_DIR)/$(CLIENT_NAME)
SERVER_OUTPUT_PATH  = $(MAKEFILE_DIR)/$(SERVER_NAME)
CLIENT_INSTALL_PATH = $(INSTALL_DIR)/$(CLIENT_NAME)
SERVER_INSTALL_PATH = $(INSTALL_DIR)/$(SERVER_NAME)
GO_FILES			= $(shell find go -name '*.go')
GO_DEPS				= go/go.mod $(GO_FILES)

# run

.PHONY: run.client
run.client: deps
	cd $(GO_DIR) && go run .

.PHONY: run.server
run.server: deps
	cd $(GO_SERVER_DIR) && go run .

.PHONY: run
run: run.client run.server

# build

.PHONY: build.client
build.client: deps $(CLIENT_OUTPUT_PATH)
$(CLIENT_OUTPUT_PATH): $(GO_DEPS)
	cd $(GO_DIR) && go build -o $@ .

.PHONY: build.server
build.server: deps $(SERVER_OUTPUT_PATH)
$(SERVER_OUTPUT_PATH): $(GO_DEPS)
	cd $(GO_SERVER_DIR) && go build -o $@ .

.PHONY: build
build: build.client build.server

.PHONY: install.client
install.client: deps
${CLIENT_INSTALL_PATH}: $(GO_DEPS)
	cd $(GO_DIR) && go build -o $@  .

.PHONY: install.server
install.server: deps
${SERVER_INSTALL_PATH}: $(GO_DEPS)
	cd $(GO_SERVER_DIR) && go build -o $@ .

.PHONY: install
install: install.client install.server

.PHONY: update_ami
update_ami:
	cd $(PACKER_DIR) && \
	packer init . && \
	packer build -force \
		-var 'aws_region=$(AWS_REGION)' \
		-var 'github_remote=$(GITHUB_REMOTE)' \
		-var 'github_branch=$(GITHUB_BRANCH)' \
		-var 'server_go_version=$(SERVER_GO_VERSION)' \
		.

# deps

.PHONY: deps
deps: generate.proto go/go.sum

# deps: go mod

%.sum: go/go.mod
	cd $(GO_DIR) && go mod tidy -v
	touch $@

# deps: protos

.PHONY: generate.proto
generate.proto: go/server/grpc/server/server.pb.go go/server/grpc/server/server_grpc.pb.go

go/server/grpc/server/server.pb.go: go/server/grpc/server.proto
	protoc -I$(dir $<) --go_out=$(dir $<) "$<"

go/server/grpc/server/server_grpc.pb.go: go/server/grpc/server.proto
	protoc -I$(dir $<) --go-grpc_out=$(dir $<) "$<"

# clean

.PHONY: clean
clean:
	cd $(GO_DIR) && go clean
	rm -f $(CLIENT_OUTPUT_PATH) $(SERVER_OUTPUT_PATH)
