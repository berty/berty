.PHONY: all
all: generate test

.PHONY: test
test:
	cd go; make test

.PHONY: generate
generate:
	cd go; make generate
	cd js; make generate
	cd docs; make generate

.PHONY: clean
clean:
	cd go; make clean
	cd js; make clean
	cd docs; make clean
