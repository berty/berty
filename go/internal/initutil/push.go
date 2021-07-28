package initutil

import (
	"context"
	crand "crypto/rand"
	"fmt"
	"io/ioutil"
	"os"
	"path"

	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const DefaultPushKeyFilename = "push.key"

func GetDevicePushKeyForPath(filePath string, createIfMissing bool) (pk *[cryptoutil.KeySize]byte, sk *[cryptoutil.KeySize]byte, err error) {
	contents, err := ioutil.ReadFile(filePath)
	if os.IsNotExist(err) && createIfMissing {
		if err := os.MkdirAll(path.Dir(filePath), 0o700); err != nil {
			return nil, nil, errcode.ErrInternal.Wrap(err)
		}

		pk, sk, err = box.GenerateKey(crand.Reader)
		if err != nil {
			return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		contents = make([]byte, cryptoutil.KeySize*2)
		for i := 0; i < cryptoutil.KeySize; i++ {
			contents[i] = pk[i]
			contents[i+cryptoutil.KeySize] = sk[i]
		}

		if _, err := os.Create(filePath); err != nil {
			return nil, nil, errcode.ErrInternal.Wrap(err)
		}

		if err := ioutil.WriteFile(filePath, contents, 0o600); err != nil {
			return nil, nil, errcode.ErrInternal.Wrap(err)
		}

		return pk, sk, nil
	} else if err != nil {
		return nil, nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("unable to get device push key"))
	}

	pkVal := [cryptoutil.KeySize]byte{}
	skVal := [cryptoutil.KeySize]byte{}

	for i := 0; i < cryptoutil.KeySize; i++ {
		pkVal[i] = contents[i]
		skVal[i] = contents[i+cryptoutil.KeySize]
	}

	return &pkVal, &skVal, nil
}

func GetMessengerPushReceiver(ctx context.Context, accountRoot string, pushKey *[cryptoutil.KeySize]byte, logger *zap.Logger) (bertymessenger.MessengerPushReceiver, func(), error) {
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
		PushKey:       pushKey,
	})
	if err != nil {
		defer func() { _ = rootDS.Close() }()
		defer tearDown()
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return bertymessenger.NewPushReceiver(ctx, db, pushHandler, logger), func() {
		tearDown()
		_ = rootDS.Close()
	}, nil
}

func (m *Manager) SetDevicePushKeyPath(keyPath string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// the following check is here to help developers avoid having
	// strange states by using multiple instances of the notification manager
	if m.Node.Protocol.DevicePushKeyPath != "" {
		panic("initutil.SetDevicePushKeyPath was called but there was already an existing value")
	}

	m.Node.Protocol.DevicePushKeyPath = keyPath
}
