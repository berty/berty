// Package gomodhack ensures that `go mod` detect some required dependencies.
// This package should not be imported directly.
package gomodhack

import (
	_ "github.com/gogo/protobuf/gogoproto"          // required by protoc
	_ "github.com/gogo/protobuf/types"              // required by protoc
	_ "github.com/golang/protobuf/proto"            // required by protoc
	_ "github.com/golang/protobuf/ptypes/timestamp" // required by protoc
)
