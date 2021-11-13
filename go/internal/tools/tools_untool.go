//go:build !tools
// +build !tools

// Package tools ensures that `go mod` detect some required dependencies.
//
// This package should not be imported directly.
//
// This file is a noop to make `go list` happy.
package tools
