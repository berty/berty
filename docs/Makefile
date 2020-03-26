##
## Code gen
##

PROTOS_SRC := $(wildcard ../api/*.proto)
GEN_SRC := $(PROTOS_SRC) Makefile
GEN_SUM := gen.sum

all: generate

.PHONY: clean
clean:
	rm -f gen.sum $(wildcard */*.md.tmp)

.PHONY: generate
generate: gen.sum
$(GEN_SUM): $(GEN_SRC)
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	diff -q $(GEN_SUM).tmp $(GEN_SUM) || ( \
	  set -e; \
	  (set -e; cd .. && GO111MODULE=on go mod vendor); \
	  docker run \
	    --user=`id -u` \
	    --volume="$(PWD)/..:/go/src/berty.tech/berty" \
	    --workdir="/go/src/berty.tech/berty/docs" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:22 \
	    -xec 'make generate_local' \
	)

PROTOC_OPTS = -I ../vendor/github.com/grpc-ecosystem/grpc-gateway:../api:../vendor:/protobuf
.PHONY: generate_local
generate_local:
	protoc $(PROTOC_OPTS) --doc_out=./protocol --doc_opt=markdown,api.md.tmp ../api/bertyprotocol.proto ../api/bertytypes.proto
	@# repace multiple empty lines with one
	cat protocol/api.md.tmp | sed '/^$$/N;/^\n$$/D' > protocol/api.md
	rm -f */*.md.tmp
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	mv $(GEN_SUM).tmp $(GEN_SUM)
