.PHONY: install
install: generate
	go install -v ./cmd/...

.PHONY: test
test: unittest lint tidy

.PHONY: unittest
unittest: generate
	go test -v -cover -coverprofile=coverage.txt -covermode=atomic -race ./...

.PHONY: lint
lint: generate
	golangci-lint run --verbose ./...

.PHONY: tidy
tidy: generate
	go mod tidy

.PHONY: docker.build
docker.build: generate
	docker build -t bertytech/berty .

##
## Code gen
##

PROTOS_SRC := $(wildcard ../api/*.proto) $(wildcard ../api/internal/*.proto)
GEN_SRC := $(PROTOS_SRC) Makefile
GEN_SUM := gen.sum

.PHONY: clean
clean:
	rm -f gen.sum $(wildcard */*/*.pb.go)

.PHONY: generate
generate: gen.sum
$(GEN_SUM): $(GEN_SRC)
	shasum $(GEN_SRC) | sort > $(GEN_SUM).tmp
	diff -q $(GEN_SUM).tmp $(GEN_SUM) || ( \
	  set -e; \
	  GO111MODULE=on go mod vendor; \
	  docker run \
	    --user=`id -u` \
	    --volume="$(PWD)/..:/go/src/berty.tech" \
	    --workdir="/go/src/berty.tech/go" \
	    --entrypoint="sh" \
	    --rm \
	    bertytech/protoc:18 \
	    -xec 'make generate_local'; \
	    make tidy \
	)

.PHONY: generate_local
generate_local:
	@set -e; for proto in $(PROTOS_SRC); do ( set -xe; \
	  protoc -I ../api:../go/vendor:/protobuf --gogofaster_out="plugins=grpc:$(GOPATH)/src" "$$proto" \
	); done
	goimports -w ./pkg ./cmd ./internal
	shasum $(GEN_SRC) | sort > $(GEN_SUM).tmp
	mv $(GEN_SUM).tmp $(GEN_SUM)
