BINARY_NAME=infra

build:
	go build -o ${BINARY_NAME} .

deps:
	go mod tidy

fmt:
	gofmt -s -w -l .

clean:
	go clean
	rm ${BINARY_NAME}
