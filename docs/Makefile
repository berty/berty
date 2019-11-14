##
## Code gen
##

PROTOS_SRC := $(wildcard ../api/*.proto) # $(wildcard ../api/go-internal/*.proto) $(wildcard ../api/js-internal/*.proto)
GEN_SRC := $(PROTOS_SRC) Makefile
GEN_SUM := gen.sum

.PHONY: clean
clean:
	rm -f gen.sum $(wildcard *.swagger.json) $(wildcard *.swagger.yaml)

.PHONY: generate
generate: gen.sum
$(GEN_SUM): $(GEN_SRC)
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	diff -q $(GEN_SUM).tmp $(GEN_SUM) || ( \
	  set -e; \
	  (set -e; cd ../go && GO111MODULE=on go mod vendor); \
	  docker run \
	    --user=`id -u` \
	    --volume="$(PWD)/..:/go/src/berty.tech" \
	    --workdir="/go/src/berty.tech/docs" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:20 \
	    -xec 'make generate_local' \
	)

.PHONY: generate_local
generate_local:
	protoc -I ../api:../go/vendor:/protobuf --swagger_out=logtostderr=true:./protocol ../api/bertyprotocol.proto
	protoc -I ../api:../go/vendor:/protobuf --swagger_out=logtostderr=true:./chat ../api/chatmodel.proto
	protoc -I ../api:../go/vendor:/protobuf --swagger_out=logtostderr=true:./chat ../api/bertychat.proto
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	mv $(GEN_SUM).tmp $(GEN_SUM)
