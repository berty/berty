##
## Code gen
##

GEN_SRC := $(wildcard ../api/*.proto) $(wildcard ../api/*.yaml) Makefile
GEN_SUM := gen.sum

all: generate

.PHONY: gen.clean
gen.clean:
	rm -f gen.sum $(wildcard */*.md.tmp) $(wildcard */*.swagger.json) $(wildcard */*.swagger.json)

.PHONY: regenerate
regenerate: gen.clean generate

.PHONY: generate
generate: gen.sum
$(GEN_SUM): $(GEN_SRC)
	@shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	@diff -q $(GEN_SUM).tmp $(GEN_SUM) || ( \
	  set -xe; \
	  (set -e; cd .. && GO111MODULE=on go mod vendor); \
	  docker run \
	    --user=`id -u` \
	    --volume="$(PWD)/..:/go/src/berty.tech/berty" \
	    --workdir="/go/src/berty.tech/berty/docs" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:25 \
	    -xec 'make generate_local' \
	)

PROTOC_OPTS = -I ../vendor/github.com/grpc-ecosystem/grpc-gateway:../api:../vendor:/protobuf
.PHONY: generate_local
generate_local:
	protoc $(PROTOC_OPTS) --doc_out=./protocol  --doc_opt=markdown,api.md.tmp ../api/bertyprotocol.proto ../api/bertytypes.proto
	protoc $(PROTOC_OPTS) --doc_out=./messenger --doc_opt=markdown,api.md.tmp ../api/bertymessenger.proto
	@# repace multiple empty lines with one
	cat protocol/api.md.tmp | sed '/^$$/N;/^\n$$/D' > protocol/api.md
	cat messenger/api.md.tmp | sed '/^$$/N;/^\n$$/D' > messenger/api.md
	rm -f */*.md.tmp
	shasum $(GEN_SRC) | sort -k 2 > $(GEN_SUM).tmp
	mv $(GEN_SUM).tmp $(GEN_SUM)
	@# FIXME: patch file with version
	@# FIXME: use allow_merge=true (requires v2)
	protoc $(PROTOC_OPTS) --swagger_out=logtostderr=true,grpc_api_configuration=../api/bertyprotocol.yaml:./protocol  ../api/bertyprotocol.proto
	protoc $(PROTOC_OPTS) --swagger_out=logtostderr=true,grpc_api_configuration=../api/bertymessenger.yaml:./messenger ../api/bertymessenger.proto

BUMP_TOKEN ?=
.PHONY: openapi.prepare
openapi.prepare: gen.sum
	mkdir -p .tmp/openapi
	cat ./messenger/bertymessenger.swagger.json | jq '.info.version="'`git describe --tags --always`'"' > .tmp/openapi/bertymessenger.swagger.json
	cat ./protocol/bertyprotocol.swagger.json   | jq '.info.version="'`git describe --tags --always`'"' > .tmp/openapi/bertyprotocol.swagger.json
	cat .tmp/openapi/*.swagger.json | jq .info.version


.PHONY: bump.validate
bump.validate: openapi.prepare
	@# gem install bump-cli
	bump validate --token=$(BUMP_TOKEN) --doc=f3c48f1c-2b5b-4d3f-9ddb-40f6cf09b905 .tmp/openapi/bertymessenger.swagger.json
	bump validate --token=$(BUMP_TOKEN) --doc=6eb1bb1e-c65d-4b73-a8c4-0e545742f6db .tmp/openapi/bertyprotocol.swagger.json

.PHONY: bump.deploy
bump.deploy: bump.validate
	@# gem install bump-cli
	bump deploy --token=$(BUMP_TOKEN) --doc=f3c48f1c-2b5b-4d3f-9ddb-40f6cf09b905 .tmp/openapi/bertymessenger.swagger.json
	bump deploy --token=$(BUMP_TOKEN) --doc=6eb1bb1e-c65d-4b73-a8c4-0e545742f6db .tmp/openapi/bertyprotocol.swagger.json

.PHONY: tidy
tidy:
