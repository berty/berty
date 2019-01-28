package chunk

import (
	time "time"

	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/sql/sqlcipher"
	"github.com/go-gormigrate/gormigrate"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

type zapLogger struct {
	logger *zap.Logger
}

func (l *zapLogger) Print(values ...interface{}) {
	if len(values) < 2 {
		return
	}

	switch values[0] {
	case "sql":
		l.logger.Debug("gorm.debug.sql",
			zap.String("query", values[3].(string)),
			zap.Any("values", values[4]),
			zap.Duration("duration", values[2].(time.Duration)),
			zap.Int64("affected-rows", values[5].(int64)),
			zap.String("source", values[1].(string)), // if AddCallerSkip(6) is well defined, we can safely remove this field
		)
	default:
		l.logger.Debug("gorm.debug.other",
			zap.Any("values", values[2:]),
			zap.String("source", values[1].(string)), // if AddCallerSkip(6) is well defined, we can safely remove this field
		)
	}
}

func openDatabase() error {
	var err error

	// create storage directory if not exist

	db, err = sqlcipher.Open(deviceinfo.GetStoragePath()+"/berty.core.chunk.db", []byte("s3cur3"))
	if err != nil {
		return errorcodes.ErrChunkDaemonOpenDatabase.Wrap(err)
	}

	// init db
	db = db.Set("gorm:auto_preload", true)
	db = db.Set("gorm:association_autoupdate", false)
	db = db.Unscoped()
	db.SetLogger(&zapLogger{logger: zap.L().Named("chunk.gorm")})
	db.SingularTable(true)
	db.BlockGlobalUpdate(true)
	db.LogMode(true)

	// migrate db
	if err = gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		{
			ID: "1",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&Chunk{}).Error
			},
			Rollback: func(tx *gorm.DB) error { return nil },
		},
	}).Migrate(); err != nil {
		return err
	}

	cleanDatabase()
	// clean database each 10 minutes
	go func() {
		for db != nil || db.DB().Ping() == nil {
			select {
			case <-time.After(time.Minute * 10):
				if err := cleanDatabase(); err != nil {
					logger().Error("chunk cannot clean database", zap.Error(err))
				}
			}
		}

	}()

	return nil
}

func cleanDatabase() error {
	yesterday := time.Now().AddDate(0, 0, -1).UTC()
	count := 0
	err := db.Where("created_at <= ?", yesterday).Count(&count).Delete(&Chunk{}).Error
	if count > 0 && err != nil {
		return err
	}
	return nil
}

func save(chunk *Chunk) error {
	for db == nil || db.DB().Ping() != nil {
		if err := openDatabase(); err != nil {
			logger().Error(err.Error())
			time.Sleep(time.Second)
		} else {
			break
		}
	}
	if err := db.Save(chunk).Error; err != nil {
		return errorcodes.ErrChunkSave.Wrap(err)
	}
	return nil
}

func findAllSlices() ([][]*Chunk, error) {
	firstChunks := []*Chunk{}
	if err := db.Where(&Chunk{Index: 0}).Find(&firstChunks).Error; err != nil {
		return nil, errorcodes.ErrChunkFindAllSlices.Wrap(err)
	}
	slices := [][]*Chunk{}
	for _, chunk := range firstChunks {
		slice, err := findSliceByID(chunk.SliceID)
		if err != nil {
			continue
		}
		slices = append(slices, slice)
	}
	return slices, nil
}

func findSliceByID(sliceID string) ([]*Chunk, error) {
	slice := []*Chunk{}
	if err := db.Order("index").Where(&Chunk{SliceID: sliceID}).Find(&slice).Error; err != nil {
		return nil, errorcodes.ErrChunkFindSliceByID.Wrap(err)
	}
	return slice, nil
}
