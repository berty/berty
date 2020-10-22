package bertymessenger

import (
	"archive/tar"
	"io"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const exportLocalDBState = "messenger/local_db_state"

func exportMessengerData(writer io.Writer, db *gorm.DB, logger *zap.Logger) error {
	tw := tar.NewWriter(writer)

	dbState := keepDatabaseLocalState(db, logger)
	dbStateBytes, err := proto.Marshal(dbState)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	if err := tw.WriteHeader(&tar.Header{
		Typeflag: tar.TypeReg,
		Name:     exportLocalDBState,
		Size:     int64(len(dbStateBytes)),
		Mode:     0o600,
	}); err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	if _, err := tw.Write(dbStateBytes); err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	if err := tw.Close(); err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	return nil
}
