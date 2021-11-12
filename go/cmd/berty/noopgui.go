//go:build !bertygui
// +build !bertygui

package main

import "github.com/peterbourgon/ff/v3/ffcli"

func guiCommand() (*ffcli.Command, func() error) {
	return nil, nil
}
