//go:build tools
// +build tools

// Package tools ensures that `go mod` detect some required dependencies.
//
// This package should not be imported directly.
package tools

import (
	// build tool
	_ "github.com/buicongtan1997/protoc-gen-swagger-config"
	// required by Makefile
	_ "github.com/campoy/embedmd"
	// required by Makefile
	_ "github.com/daixiang0/gci"
	// required for dev
	_ "github.com/githubnemo/CompileDaemon"
	// required by protoc
	_ "github.com/gogo/protobuf/gogoproto"
	// required by protoc
	_ "github.com/gogo/protobuf/proto"
	// required by protoc
	_ "github.com/gogo/protobuf/protoc-gen-gogo"
	// required by protoc
	_ "github.com/gogo/protobuf/types"
	// required by protoc
	_ "github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway"
	// required by protoc
	_ "github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger"
	// keep switching between disappearing and indirect
	_ "github.com/kr/pretty"
	// required by Makefile
	_ "github.com/mdomke/git-semver/v5"
	// required by protoc
	_ "github.com/pseudomuto/protoc-gen-doc/cmd/protoc-gen-doc"
	// required by Makefile
	_ "github.com/tailscale/depaware"
	// required by gomobile
	_ "golang.org/x/mobile/cmd/gomobile"
	// required by Makefile
	_ "golang.org/x/tools/cmd/goimports"
	// required by Makefile
	_ "moul.io/testman"
	// required by Makefile
	_ "mvdan.cc/gofumpt"
)
