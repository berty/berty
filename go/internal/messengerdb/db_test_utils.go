package messengerdb

import (
	"fmt"
	"testing"
	"time"

	sqlite "github.com/flyingtime/gorm-sqlcipher"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	"berty.tech/berty/v2/go/internal/testutil"
)

type GetInMemoryTestDBOpts int32

const (
	GetInMemoryTestDBOptsUndefined = iota
	GetInMemoryTestDBOptsNoInit
	GetInMemoryTestDBOptsStdOutLogger
	GetInMemoryTestDBOptsNoFTS
)

var _ = GetInMemoryTestDBOptsUndefined

func GetInMemoryTestDB(t testing.TB, opts ...GetInMemoryTestDBOpts) (*DBWrapper, *gorm.DB, func()) {
	t.Helper()

	init := true
	log := zap.NewNop()
	loggerCleanup := func() {}
	noFTS := false

	for _, o := range opts {
		switch o {
		case GetInMemoryTestDBOptsNoInit:
			init = false
		case GetInMemoryTestDBOptsStdOutLogger:
			log, loggerCleanup = testutil.Logger(t)
		case GetInMemoryTestDBOptsNoFTS:
			noFTS = true
		}
	}

	zapLogger := zapgorm2.New(log)
	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano())), &gorm.Config{
		Logger:                                   zapLogger,
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		t.Fatal(err)
	}

	wrappedDB := NewDBWrapper(db, log)
	if noFTS {
		wrappedDB = wrappedDB.DisableFTS()
	}

	if init {
		if err := wrappedDB.InitDB(noopReplayer); err != nil {
			t.Fatal(err)
		}
	}

	d, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}

	return wrappedDB, db, func() {
		_ = d.Close()
		loggerCleanup()
	}
}
