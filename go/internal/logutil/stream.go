package logutil

import (
	"go.uber.org/zap"
	"moul.io/zapring"
)

const (
	typeStd    = "std"
	typeRing   = "ring"
	typeFile   = "file"
	typeCustom = "custom"
)

type Stream struct {
	kind        string
	filters     string
	format      string
	path        string
	ring        *zapring.Core
	sessionKind string
	baseLogger  *zap.Logger
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

// NewFileStream creates a new file stream backed by Lumberjack with sane default values.
//
// Usually, Lumberjack is used as a rolling log file and is intended to be reused from a session to another,
// In Berty, we want one file per session named with the start time instead of the rotation time.
//
// If the provided path is a directory, it will create files in that directory with the following pattern:
// `<path>/<session-kind>-<start-time>.log`.
//
// If the provided path is a path finishing with ".log", then, the path will be taken as it,
// instead of creating a new file, it will append new lines to the existing one;
// this can be particularly useful to keep a `tail -f` running.
func NewFileStream(filters, format, path, sessionKind string) Stream {
	return Stream{
		kind:        typeFile,
		filters:     filters,
		format:      format,
		path:        path,
		sessionKind: sessionKind,
	}
}

func NewCustomStream(filters string, logger *zap.Logger) Stream {
	return Stream{
		kind:       typeCustom,
		filters:    filters,
		baseLogger: logger,
	}
}
