generate:
	rm -rf .tmp
	go run ../tool/config-generator/main.go
	go run mvdan.cc/gofumpt -w -s ../go/internal/config/config.gen.go
	go run github.com/daixiang0/gci write --Section Standard --Section Default --Section 'Prefix(berty.tech)' ../go/internal/config/config.gen.go
	go run github.com/campoy/embedmd -w ../go/cmd/testbot/README.md
	go run github.com/campoy/embedmd -w ../go/cmd/welcomebot/README.md

test:
	go test -v ../go/internal/config
