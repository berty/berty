SRCS := $(wildcard *.go)

bench: $(SRCS)
	go build $(SRCS)
	@echo "Now run './bench -h'"

help: bench
	./bench -h
