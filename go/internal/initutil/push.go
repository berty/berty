package initutil

import (
	"context"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func GetMessengerPushReceiver(ctx context.Context, accountRoot string, logger *zap.Logger) (bertymessenger.MessengerPushReceiver, func(), error) {
	// TODO: target account might be already opened

	accountPath, err := getDatastoreDir(accountRoot)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	rootDS, err := getRootDatastoreForPath(accountPath, true, logger)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	db, tearDown, err := getMessengerDBForPath(accountPath, logger)
	if err != nil {
		defer func() { _ = rootDS.Close() }()
		return nil, nil, errcode.TODO.Wrap(err)
	}

	pushHandler, err := bertyprotocol.NewPushHandler(&bertyprotocol.Opts{
		Logger:        logger,
		RootDatastore: rootDS,
	})
	if err != nil {
		defer func() { _ = rootDS.Close() }()
		defer tearDown()
		return nil, nil, errcode.TODO.Wrap(err)
	}

	receiver, err := bertymessenger.NewPushReceiver(ctx, db, pushHandler, logger)
	if err != nil {
		defer func() { _ = rootDS.Close() }()
		defer tearDown()
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return receiver, func() {
		tearDown()
		_ = rootDS.Close()
	}, errcode.ErrNotImplemented
}
