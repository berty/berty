// Package gomodhack ensures that `go mod` detect some required dependencies.
//
// This package should not be imported directly.
package gomodhack

import (
	_ "github.com/alta/protopatch/patch"                    // required by protoc
	_ "github.com/gogo/protobuf/gogoproto"                  // required by protoc
	_ "github.com/gogo/protobuf/types"                      // required by protoc
	_ "github.com/golang/protobuf/proto"                    // required by protoc
	_ "github.com/golang/protobuf/protoc-gen-go/descriptor" // required by protoc
	_ "github.com/golang/protobuf/ptypes/timestamp"         // required by protoc
	_ "google.golang.org/protobuf/proto"                    // required by protoc
)
