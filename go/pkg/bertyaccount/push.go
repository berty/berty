package bertyaccount

import (
	"context"
	"fmt"
	"path"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func PushDecrypt(ctx context.Context, rootDir string, input []byte, logger *zap.Logger) (*protocoltypes.PushReceive_Reply, *AccountMetadata, error) {
	if logger == nil {
		logger = zap.NewNop()
	}

	accounts, err := listAccounts(rootDir, logger)
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no accounts found"))
	}

	for _, account := range accounts {
		accountDir := path.Join(rootDir, account.AccountID)
		reply, err := pushDecryptAttemptForAccount(ctx, accountDir, input, logger)
		if err != nil {
			continue
		}

		return reply, account, nil
	}

	return nil, nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("couldn't find an account able to decrypt push payload"))
}

func pushDecryptAttemptForAccount(ctx context.Context, accountDir string, input []byte, logger *zap.Logger) (*protocoltypes.PushReceive_Reply, error) {
	pushReceiver, tearDown, err := initutil.GetMessengerPushReceiver(ctx, accountDir, logger)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	defer tearDown()

	return pushReceiver.PushReceive(ctx, input)
}
