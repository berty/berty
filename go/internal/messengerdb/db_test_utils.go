package messengerdb

import (
	"fmt"
	"testing"
	"time"

	sqlite "github.com/glebarez/sqlite"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	// sqlite "gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	"berty.tech/weshnet/pkg/testutil"
)

type GetInMemoryTestDBOpts int32

const (
	GetInMemoryTestDBOptsUndefined = iota
	GetInMemoryTestDBOptsNoInit
	GetInMemoryTestDBOptsStdOutLogger
	GetInMemoryTestDBOptsNoFTS
)

var _ = GetInMemoryTestDBOptsUndefined

// Define a custom callback struct
type ConnectionMonitor struct{}

func GetInMemoryTestDB(t testing.TB, opts ...GetInMemoryTestDBOpts) (*DBWrapper, *gorm.DB, func()) {
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
	// dbsql := sqlite.Open(":memory:")
	dbsql := sqlite.Open(fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano()))

	db, err := gorm.Open(dbsql, &gorm.Config{
		Logger:                                   zapLogger,
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	require.NoError(t, err)

	wrappedDB := NewDBWrapper(db, log)
	if noFTS {
		wrappedDB = wrappedDB.DisableFTS()
	}

	if init {
		err := wrappedDB.InitDB(noopReplayer)
		require.NoError(t, err)
	}

	d, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}

	// var muCounter sync.Mutex
	// var counter int64

	// Listen for the "gorm:opened" event and increment the open connection count
	// db.Callback().Create().Before("gorm:opened").Register("connectionMonitor:opened", func(db *gorm.DB) {
	// 	muCounter.Lock()

	// 	counter += 1
	// 	if counter > 1 {
	// 		panic("toto")
	// 	}
	// 	fmt.Printf("Open Connections: %d\n", counter)
	// 	muCounter.Unlock()
	// })

	// // Listen for the "gorm:closed" event and decrement the open connection count
	// db.Callback().Create().After("gorm:closed").Register("connectionMonitor:closed", func(db *gorm.DB) {
	// 	muCounter.Lock()
	// 	counter -= 1
	// 	fmt.Printf("Open Connections: %d\n", counter)
	// 	muCounter.Unlock()
	// })

	// fixes error "database is locked", caused by concurrent access from deal goroutines to a single sqlite3 db connection
	// see: https://github.com/mattn/go-sqlite3#:~:text=Error%3A%20database%20is%20locked
	// see: https://github.com/filecoin-project/boost/pull/657
	d.SetMaxOpenConns(1)

	return wrappedDB, db, func() {
		loggerCleanup()
	}
}
