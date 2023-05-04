package messengerdb

import (
	sqlite "github.com/glebarez/go-sqlite"
	sqlite3 "modernc.org/sqlite/lib"
)

type ErrorCode int

const (
	SQLITE_ABORT      = sqlite3.SQLITE_ABORT
	SQLITE_AUTH       = sqlite3.SQLITE_AUTH
	SQLITE_BUSY       = sqlite3.SQLITE_BUSY
	SQLITE_CANTOPEN   = sqlite3.SQLITE_CANTOPEN
	SQLITE_CONSTRAINT = sqlite3.SQLITE_CONSTRAINT
	SQLITE_CORRUPT    = sqlite3.SQLITE_CORRUPT
	SQLITE_DONE       = sqlite3.SQLITE_DONE
	SQLITE_EMPTY      = sqlite3.SQLITE_EMPTY
	SQLITE_ERROR      = sqlite3.SQLITE_ERROR
	SQLITE_FORMAT     = sqlite3.SQLITE_FORMAT
	SQLITE_FULL       = sqlite3.SQLITE_FULL
	SQLITE_INTERNAL   = sqlite3.SQLITE_INTERNAL
	SQLITE_INTERRUPT  = sqlite3.SQLITE_INTERRUPT
	SQLITE_IOERR      = sqlite3.SQLITE_IOERR
	SQLITE_LOCKED     = sqlite3.SQLITE_LOCKED
	SQLITE_MISMATCH   = sqlite3.SQLITE_MISMATCH
	SQLITE_MISUSE     = sqlite3.SQLITE_MISUSE
	SQLITE_NOLFS      = sqlite3.SQLITE_NOLFS
	SQLITE_NOMEM      = sqlite3.SQLITE_NOMEM
	SQLITE_NOTADB     = sqlite3.SQLITE_NOTADB
	SQLITE_NOTFOUND   = sqlite3.SQLITE_NOTFOUND
	SQLITE_NOTICE     = sqlite3.SQLITE_NOTICE
	SQLITE_PERM       = sqlite3.SQLITE_PERM
	SQLITE_PROTOCOL   = sqlite3.SQLITE_PROTOCOL
	SQLITE_RANGE      = sqlite3.SQLITE_RANGE
	SQLITE_READONLY   = sqlite3.SQLITE_READONLY
	SQLITE_ROW        = sqlite3.SQLITE_ROW
	SQLITE_SCHEMA     = sqlite3.SQLITE_SCHEMA
	SQLITE_TOOBIG     = sqlite3.SQLITE_TOOBIG
	SQLITE_WARNING    = sqlite3.SQLITE_WARNING
)

func isSQLiteError(err error, code ErrorCode) bool {
	e, ok := err.(*sqlite.Error)
	if !ok {
		return false
	}

	return (e.Code() & int(code)) == int(code)
}
