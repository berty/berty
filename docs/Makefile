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
		bertytech/buf:1 \
	    -xec 'make generate_local' \
	)
protoc_opts := -I ../api:`go list -m -mod=mod -f {{.Dir}} github.com/grpc-ecosystem/grpc-gateway`/third_party/googleapis:`go list -m -mod=mod -f {{.Dir}} github.com/gogo/protobuf`:/protobuf
.PHONY: generate_local
generate_local:
	mkdir -p messenger
	buf generate --template ./buf-doc.gen.yaml ../api/messengertypes/messengertypes.proto -o messenger
	@# replace multiple empty lines with one
	cat messenger/api.md.tmp | sed '/^$$/N;/^\n$$/D' > messenger/api.md
	rm -f */*.md.tmp
	shasum $(gen_src) | sort -k 2 > $(gen_sum).tmp
	mv $(gen_sum).tmp $(gen_sum)
	mv messenger/api.md apis/messengertypes.md
	mv messenger/api.json apis/messengertypes.json

.PHONY: openapi.prepare
openapi.prepare: gen.sum
	mkdir -p .tmp/openapi
	cat ./messenger/messengertypes.swagger.json | jq '.info.version="'$(VERSION)'"' > .tmp/openapi/messengertypes.swagger.json
	cat .tmp/openapi/*.swagger.json | jq .info.version

BUMP_TOKEN ?=
.PHONY: bump.validate
bump.validate: openapi.prepare
	@# gem install bump-cli
	bump validate --token=$(BUMP_TOKEN) --doc=f3c48f1c-2b5b-4d3f-9ddb-40f6cf09b905 .tmp/openapi/messengertypes.swagger.json
.PHONY: bump.deploy
bump.deploy: bump.validate
	@# gem install bump-cli
	bump deploy --token=$(BUMP_TOKEN) --doc=f3c48f1c-2b5b-4d3f-9ddb-40f6cf09b905 .tmp/openapi/messengertypes.swagger.json

.PHONY: tidy
tidy:
