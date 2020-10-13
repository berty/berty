generate:
	go run ../tool/config-generator/main.go
	goimports -w ../go/internal/config/config.gen.go
	go run github.com/campoy/embedmd -w ../go/cmd/testbot/README.md
	go run github.com/campoy/embedmd -w ../go/cmd/betabot/README.md

test:
	go test -v ../go/internal/config
