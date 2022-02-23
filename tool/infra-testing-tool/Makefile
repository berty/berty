MAKEFILE_DIR=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
GO_DIR=$(MAKEFILE_DIR)/go
GO_SERVER_DIR=$(GO_DIR)/server

CLIENT_NAME=berty-infra-client
CLIENT_OUTPUT_PATH=$(MAKEFILE_DIR)/$(CLIENT_NAME)

SERVER_NAME=berty-infra-server
SERVER_OUTPUT_PATH=$(MAKEFILE_DIR)/$(SERVER_NAME)

.PHONY: run.client
run.client: deps
	cd $(GO_DIR) && go run .

.PHONY: run.server
run.server: deps
	cd $(GO_SERVER_DIR) && go run .

.PHONY: run
run: run.client run.server

.PHONY: build.client
build.client: deps
	cd $(GO_DIR) && go build -o ${CLIENT_OUTPUT_PATH} .

.PHONY: build.server
build.server: deps
	cd $(GO_SERVER_DIR) && go build -o ${SERVER_OUTPUT_PATH} .

.PHONY: build
build: build.client build.server

.PHONY: install.client
install.client: build.client
	mv $(CLIENT_OUTPUT_PATH) /usr/local/bin

.PHONY: install.server
install.server: build.server
	mv $(SERVER_OUTPUT_PATH) /usr/local/bin

.PHONY: install
install: install.client install.server

.PHONY: deps
deps:
	cd $(GO_DIR) && go mod tidy

.PHONY: clean
clean:
	cd $(GO_DIR) && go clean
	rm -f $(CLIENT_OUTPUT_PATH) $(SERVER_OUTPUT_PATH)
