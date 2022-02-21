BINARY_NAME=berty_infra_testing

MAKEFILE_DIR = $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

build: deps
	cd $(MAKEFILE_DIR) && go build -o ${BINARY_NAME} .

deps:
	cd $(MAKEFILE_DIR) && go mod tidy

install: build
	mv $(MAKEFILE_DIR)/${BINARY_NAME} /usr/local/bin

fmt:
	cd $(MAKEFILE_DIR) && gofmt -s -w -l .

clean:
	go clean
	rm $(MAKEFILE_DIR)/${BINARY_NAME}
