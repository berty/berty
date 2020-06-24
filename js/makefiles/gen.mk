GO ?= go
PROTOS_SRC := ../vendor/github.com/gogo/protobuf/gogoproto/gogo.proto \
	../api/bertytypes.proto \
	../api/bertyprotocol.proto \
	../api/bertymessenger.proto \

OUT_DIR = $(BERTY_ROOT)/js/packages/store/protocol/grpc-web-gen
GEN_SRC := $(PROTOS_SRC) makefiles/gen.mk
# yarn.lock could be added to GEN_SRC to also pin protoc-gen-ts' version but it's not worth it.
# Having to regen every time we change a dependency is not very welcoming for contributors
GEN_SUM := gen.sum

.PHONY: pb.generate
pb.generate: $(GEN_SUM)

.PHONY: $(GEN_SUM)
$(GEN_SUM): $(GEN_SRC)
	$(call check-program, shasum docker $(GO))
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	@diff -q $(GEN_SUM).tmp $(GEN_SUM) || ( \
	  uid=`id -u`; \
	  set -xe; \
		cd $(BERTY_ROOT)/go; \
	  $(GO) mod vendor; \
		cd $(PWD); \
	  docker run \
	    --user="$$uid" \
	    --volume="$(BERTY_ROOT):/go/src/berty.tech/berty" \
	    --workdir="/go/src/berty.tech/berty/js" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:23 \
	    -xec 'make generate_local'; \
	)

.PHONY: gen
gen: pb.generate

.PHONY: generate_local
generate_local:
	$(call check-program, shasum protoc)
	rm -fr $(OUT_DIR)
	mkdir -p $(OUT_DIR)
	protoc \
	  --plugin=protoc-gen-ts=$(PWD)/node_modules/.bin/protoc-gen-ts \
	  -I ../api:../vendor:/protobuf \
	  --js_out=import_style=commonjs,binary:$(OUT_DIR) \
	  --ts_out=service=grpc-web:$(OUT_DIR) \
	  $(PROTOS_SRC)
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	mv $(GEN_SUM).tmp $(GEN_SUM)
