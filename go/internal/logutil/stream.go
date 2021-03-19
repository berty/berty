package logutil

import (
	"moul.io/zapring"
	lumberjack "gopkg.in/natefinch/lumberjack.v2"
)

const (
	typeStd        = "std"
	typeRing       = "ring"
	typeLumberjack = "lumberjack"
)

type Stream struct {
	kind       string
	filters    string
	format     string
	path       string
	ring       *zapring.Core
	lumberOpts *lumberjack.Logger
}

func NewStdStream(filters, format, path string) Stream {
	return Stream{
		kind:    typeStd,
		filters: filters,
		format:  format,
		path:    path,
	}
}

func NewRingStream(filters, format string, ring *zapring.Core) Stream {
	return Stream{
		kind:    typeRing,
		filters: filters,
		format:  format,
		ring:    ring,
	}
}

func NewLumberjackStream(filters, format string, opts *lumberjack.Logger) Stream {
	return Stream{
		kind:       typeLumberjack,
		filters:    filters,
		format:     format,
		lumberOpts: opts,
	}
}
