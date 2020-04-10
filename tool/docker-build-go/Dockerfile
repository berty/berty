FROM golang:1.14.2-buster

RUN curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s v1.21.0

RUN curl -s https://codecov.io/bash > /bin/codecov && chmod +x /bin/codecov
