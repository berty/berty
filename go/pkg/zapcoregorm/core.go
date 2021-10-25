package zapcoregorm

import (
	"encoding/json"
	"io/ioutil"
	"sync"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type LogEntry struct {
	ID uint `gorm:"primarykey"`

	LogSessionID uint

	Level      zapcore.Level
	Time       time.Time
	LoggerName string
	Message    string
	Stack      string
	Fields     []byte

	// Caller     zapcore.EntryCaller

	Defined  bool
	PC       uint64 // coerced from uintptr
	File     string
	Line     int
	Function string
}

type LogSession struct {
	ID uint `gorm:"primarykey"`

	Kind string
	Time time.Time
}

// Core is an in-memory ring buffer log that implements zapcore.Core.
type Core struct {
	nextCore   zapcore.Core
	enc        zapcore.Encoder
	db         *gorm.DB
	id         uint
	setupOnce  *sync.Once
	writeMutex *sync.Mutex
}

// New returns a gorm based core
func New(db *gorm.DB, sessionKind string) (*Core, error) {
	err := db.AutoMigrate(&LogSession{}, &LogEntry{})
	if err != nil {
		return nil, errcode.ErrDBMigrate.Wrap(err)
	}

	session := LogSession{Kind: sessionKind, Time: time.Now()}
	if err := db.Create(&session).Error; err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return &Core{
		db:         db,
		id:         session.ID,
		setupOnce:  &sync.Once{},
		writeMutex: &sync.Mutex{},
	}, nil
}

// Close implements zapcore.Core.
func (c *Core) Close() {
}

// setup sets default value for core and encoder if they are empty.
func (c *Core) setup() {
	c.setupOnce.Do(func() {
		if c.enc == nil {
			c.enc = zapcore.NewJSONEncoder(zap.NewDevelopmentEncoderConfig())
		}

		if c.nextCore == nil {
			discardCore := zapcore.NewCore(
				c.enc,
				zapcore.AddSync(ioutil.Discard),
				zap.LevelEnablerFunc(func(_ zapcore.Level) bool { return true }),
			)
			c.nextCore = discardCore
		}
	})
}

// Enabled implements zapcore.LevelEnabler.
func (c *Core) Enabled(level zapcore.Level) bool {
	c.setup()
	return c.nextCore.Enabled(level)
}

func (c *Core) ID() uint {
	c.setup()
	return c.id
}

func (c *Core) clone() *Core {
	return &Core{
		db:         c.db,
		enc:        c.enc.Clone(),
		nextCore:   c.nextCore,
		id:         c.id,
		setupOnce:  c.setupOnce,
		writeMutex: c.writeMutex,
	}
}

// Sync implements zapcore.Core.
func (c *Core) Sync() error {
	if c.nextCore != nil {
		return c.nextCore.Sync()
	}
	return nil
}

// With implements zapcore.Core.
func (c *Core) With(fields []zapcore.Field) zapcore.Core {
	c.setup()
	clone := c.clone()
	for _, field := range fields {
		field.AddTo(clone.enc)
	}
	return clone
}

// Check implements zapcore.Core.
func (c *Core) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	c.setup()
	if c.Enabled(entry.Level) {
		return checked.AddCore(entry, c)
	}
	return checked
}

// Write implements zapcore.Core.
func (c *Core) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	c.setup()

	fieldsBytes, err := json.Marshal(fields)
	if err != nil {
		return errors.Wrap(err, "marshal fields")
	}

	dbEntry := LogEntry{
		LogSessionID: c.id,

		Level:      entry.Level,
		Time:       entry.Time,
		LoggerName: entry.LoggerName,
		Message:    entry.Message,
		Stack:      entry.Stack,
		Fields:     fieldsBytes,

		Defined:  entry.Caller.Defined,
		PC:       uint64(entry.Caller.PC),
		File:     entry.Caller.File,
		Line:     entry.Caller.Line,
		Function: entry.Caller.Function,
	}

	c.writeMutex.Lock()
	if err := c.db.Create(&dbEntry).Error; err != nil {
		c.writeMutex.Unlock()
		return errors.Wrap(err, "create db entry")
	}
	c.writeMutex.Unlock()

	return c.nextCore.Write(entry, fields)
}

func LogSessionList(db *gorm.DB) ([]LogSession, error) {
	var sessions []LogSession
	if err := db.Find(&sessions).Error; err != nil {
		return nil, err
	}
	return sessions, nil
}

func LogEntriesList(db *gorm.DB, id uint) ([]LogEntry, error) {
	var entries []LogEntry
	if err := db.Find(&entries).Where("LogSessionID = ?", id).Error; err != nil {
		return nil, err
	}
	return entries, nil
}

func (c *Core) SetNextCore(core zapcore.Core) *Core {
	c.nextCore = core
	return c
}

func (c *Core) SetEncoder(enc zapcore.Encoder) *Core {
	c.enc = enc
	return c
}
