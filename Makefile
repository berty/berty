.PHONY: all
all: generate test

.PHONY: test
test:
	cd go; make test

.PHONY: generate
generate:
	cd go; make generate
	cd docs; make generate

.PHONY: clean
clean:
	cd go; make clean
	cd docs; make clean

include bazel.make

print-%:
	@echo $*: $($*)
