// +build tools

// Package tools ensures that `go mod` detect some required dependencies.
//
// This package should not be imported directly.
package tools

import (
	_ "github.com/buicongtan1997/protoc-gen-swagger-config" // build tool
	_ "github.com/gogo/protobuf/gogoproto"                  // required by protoc
	_ "github.com/gogo/protobuf/proto"                      // required by protoc
	_ "github.com/gogo/protobuf/types"                      // required by protoc
)
