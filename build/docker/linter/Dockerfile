FROM golang:1.12-alpine

# build deps
RUN apk --no-cache --update add nodejs-npm git make musl-dev gcc g++

# gometalinter
RUN go get -u github.com/golangci/golangci-lint/cmd/golangci-lint \
    && ln -s /go/bin/golangci-lint /usr/bin/golangci-lint

# dockerlint
RUN npm install --global dockerlint

# eclint
RUN npm install --global eclint
