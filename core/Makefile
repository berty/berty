rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))
GOPATH ?= $(HOME)/go
CODE_PATHS = $(filter-out node_modules/,$(wildcard */))
PROTOS = $(call rwildcard, $(CODE_PATHS), *.proto)
GENERATED_FILES = $(patsubst %.proto,%.pb.go,$(PROTOS))
PROTOC_OPTS = --proto_path=../vendor:../vendor/github.com/gogo/protobuf:.

.PHONY: all
all: test

.PHONY: test
test: generate
	go test -test.timeout 30s -v ./...

%.pb.go: %.proto
	protoc $(PROTOC_OPTS) --gofast_out=plugins=grpc:"$(GOPATH)/src" "$(dir $<)"/*.proto

.PHONY: clean
clean:
	rm -f $(GENERATED_FILES)

.PHONY: generate
generate: $(GENERATED_FILES)
