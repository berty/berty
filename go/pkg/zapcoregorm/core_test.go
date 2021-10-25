package zapcoregorm

import (
	"encoding/json"
	"errors"
	"io"
	"path/filepath"
	"testing"
	"time"

	sqlite "github.com/flyingtime/gorm-sqlcipher"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gorm.io/gorm"
)

func TestSimple(t *testing.T) {
	dsn := filepath.Join(t.TempDir(), "db.sqlite")

	testString := "Hello zapcoregorm!"
	testField := zap.Uint("field", 42)
	testFieldJSON, err := json.Marshal([]zap.Field{testField})
	require.NoError(t, err)
	errField := zap.Error(errors.New("Hello error!"))
	errFieldJSON, err := json.Marshal([]zap.Field{errField})
	require.NoError(t, err)
	sessionKind := "test"

	var coreID uint

	before := time.Now()
	func() {
		db, err := gorm.Open(sqlite.Open(dsn), nil)
		require.NoError(t, err)
		udb, err := db.DB()
		require.NoError(t, err)
		defer requireClose(t, udb)
		require.NoError(t, err)
		core, err := New(db, sessionKind)
		require.NoError(t, err)
		stdLogger, err := zap.NewDevelopment()
		require.NoError(t, err)
		core.SetNextCore(stdLogger.Core())
		defer core.Close()
		coreID = core.ID()
		logger := zap.New(core)

		logger.Info(testString, testField)
		logger.Debug(testString, testField)
		logger.Warn(testString, testField)
		logger.Error(testString, errField)
	}()
	after := time.Now()

	db, err := gorm.Open(sqlite.Open(dsn), nil)
	require.NoError(t, err)
	udb, err := db.DB()
	require.NoError(t, err)
	defer requireClose(t, udb)

	session := LogSession{}
	require.NoError(t, db.First(&session).Error)
	require.Equal(t, coreID, session.ID)
	require.Equal(t, sessionKind, session.Kind)
	require.LessOrEqual(t, before.Unix(), session.Time.Unix())
	require.GreaterOrEqual(t, after.Unix(), session.Time.Unix())

	entry := LogEntry{}
	require.NoError(t, db.First(&entry, 1).Error)
	require.Equal(t, entry.Message, testString)
	require.LessOrEqual(t, before.Unix(), entry.Time.Unix())
	require.GreaterOrEqual(t, after.Unix(), entry.Time.Unix())
	require.Equal(t, zapcore.InfoLevel, entry.Level)
	require.Equal(t, testFieldJSON, entry.Fields)
	require.Equal(t, coreID, entry.LogSessionID)

	entry = LogEntry{}
	require.NoError(t, db.First(&entry, 2).Error)
	require.Equal(t, entry.Message, testString)
	require.LessOrEqual(t, before.Unix(), entry.Time.Unix())
	require.GreaterOrEqual(t, after.Unix(), entry.Time.Unix())
	require.Equal(t, zapcore.DebugLevel, entry.Level)
	require.Equal(t, testFieldJSON, entry.Fields)
	require.Equal(t, coreID, entry.LogSessionID)

	entry = LogEntry{}
	require.NoError(t, db.First(&entry, 3).Error)
	require.Equal(t, entry.Message, testString)
	require.LessOrEqual(t, before.Unix(), entry.Time.Unix())
	require.GreaterOrEqual(t, after.Unix(), entry.Time.Unix())
	require.Equal(t, zapcore.WarnLevel, entry.Level)
	require.Equal(t, testFieldJSON, entry.Fields)
	require.Equal(t, coreID, entry.LogSessionID)

	entry = LogEntry{}
	require.NoError(t, db.First(&entry, 4).Error)
	require.Equal(t, entry.Message, testString)
	require.LessOrEqual(t, before.Unix(), entry.Time.Unix())
	require.GreaterOrEqual(t, after.Unix(), entry.Time.Unix())
	require.Equal(t, zapcore.ErrorLevel, entry.Level)
	require.Equal(t, errFieldJSON, entry.Fields)
	require.Equal(t, coreID, entry.LogSessionID)
}

func requireClose(t *testing.T, c io.Closer) {
	t.Helper()
	require.NoError(t, c.Close())
}
