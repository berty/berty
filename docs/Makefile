##
## Code gen
##

VERSION ?= `go run github.com/mdomke/git-semver/v5`

all: generate

.PHONY: gen.clean
gen.clean:
	rm -f gen.sum $(wildcard */*.md.tmp) $(wildcard */*.swagger.json) $(wildcard */*.swagger.json)

.PHONY: regenerate
regenerate: gen.clean generate

gen_src := $(wildcard ../api/*.proto) $(wildcard ../api/*.yaml) Makefile
gen_sum := gen.sum
.PHONY: generate
generate: gen.sum
$(gen_sum): $(gen_src)
	@shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	@diff -q $(gen_sum).tmp $(gen_sum) || ( \
	  set -xe; \
	  (set -e; GO111MODULE=on go mod download); \
	  docker run \
	    --user=`id -u` \
	    --volume="$(PWD)/..:/go/src/berty.tech/berty" \
	    --volume="`go env GOPATH`/pkg/mod:/go/pkg/mod" \
	    --workdir="/go/src/berty.tech/berty/docs" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:27 \
	    -xec 'make generate_local' \
	)
protoc_opts := -I ../api:`go list -m -mod=mod -f {{.Dir}} github.com/grpc-ecosystem/grpc-gateway`/third_party/googleapis:`go list -m -mod=mod -f {{.Dir}} github.com/gogo/protobuf`:/protobuf
.PHONY: generate_local
generate_local:
	mkdir -p protocol messenger
	protoc $(protoc_opts) --doc_out=./protocol  --doc_opt=markdown,api.md.tmp ../api/protocoltypes.proto
	protoc $(protoc_opts) --doc_out=./messenger --doc_opt=markdown,api.md.tmp ../api/messengertypes.proto
	@# replace multiple empty lines with one
	cat protocol/api.md.tmp | sed '/^$$/N;/^\n$$/D' > protocol/api.md
	cat messenger/api.md.tmp | sed '/^$$/N;/^\n$$/D' > messenger/api.md
	rm -f */*.md.tmp
	shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	mv $(gen_sum).tmp $(gen_sum)
	@# FIXME: patch file with version
	@# FIXME: use allow_merge=true (requires v2)
	protoc $(protoc_opts) --swagger_out=logtostderr=true,grpc_api_configuration=../api/protocoltypes.yaml:./protocol  ../api/protocoltypes.proto
	protoc $(protoc_opts) --swagger_out=logtostderr=true,grpc_api_configuration=../api/messengertypes.yaml:./messenger ../api/messengertypes.proto
	mv protocol/api.md apis/protocoltypes.md
	mv messenger/api.md apis/messengertypes.md
	mv messenger/messengertypes.swagger.json apis/
	mv protocol/protocoltypes.swagger.json apis/

.PHONY: openapi.prepare
openapi.prepare: gen.sum
	mkdir -p .tmp/openapi
	cat ./messenger/messengertypes.swagger.json | jq '.info.version="'$(VERSION)'"' > .tmp/openapi/messengertypes.swagger.json
	cat ./protocol/protocoltypes.swagger.json   | jq '.info.version="'$(VERSION)'"' > .tmp/openapi/protocoltypes.swagger.json
	cat .tmp/openapi/*.swagger.json | jq .info.version

BUMP_TOKEN ?=
.PHONY: bump.validate
bump.validate: openapi.prepare
	@# gem install bump-cli
	bump validate --token=$(BUMP_TOKEN) --doc=f3c48f1c-2b5b-4d3f-9ddb-40f6cf09b905 .tmp/openapi/messengertypes.swagger.json
	bump validate --token=$(BUMP_TOKEN) --doc=6eb1bb1e-c65d-4b73-a8c4-0e545742f6db .tmp/openapi/protocoltypes.swagger.json
.PHONY: bump.deploy
bump.deploy: bump.validate
	@# gem install bump-cli
	bump deploy --token=$(BUMP_TOKEN) --doc=f3c48f1c-2b5b-4d3f-9ddb-40f6cf09b905 .tmp/openapi/messengertypes.swagger.json
	bump deploy --token=$(BUMP_TOKEN) --doc=6eb1bb1e-c65d-4b73-a8c4-0e545742f6db .tmp/openapi/protocoltypes.swagger.json

.PHONY: tidy
tidy:
