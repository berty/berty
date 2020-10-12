generate:
	go run ../tool/config-generator/main.go
	goimports -w ../go/internal/config/config.gen.go

test:
	go test -v ../go/internal/config
