// +build tools

// Package tools ensures that `go mod` detect some required dependencies.
//
// This package should not be imported directly.
package tools

import (
	_ "github.com/buicongtan1997/protoc-gen-swagger-config"            // build tool
	_ "github.com/githubnemo/CompileDaemon"                            // required for dev
	_ "github.com/gogo/protobuf/gogoproto"                             // required by protoc
	_ "github.com/gogo/protobuf/proto"                                 // required by protoc
	_ "github.com/gogo/protobuf/protoc-gen-gogo"                       // required by protoc
	_ "github.com/gogo/protobuf/types"                                 // required by protoc
	_ "github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway" // required by protoc
	_ "github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger"      // required by protoc
	_ "github.com/pseudomuto/protoc-gen-doc/cmd/protoc-gen-doc"        // required by protoc
	_ "golang.org/x/tools/cmd/goimports"                               // required by Makefile
)
