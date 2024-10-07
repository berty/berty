package migrationsaccount

import (
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/migrationutils"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type Options struct {
	AppDir         string
	SharedDir      string
	Logger         *zap.Logger
	NativeKeystore accountutils.NativeKeystore
	AccountID      string

	accountAppDir    string
	accountSharedDir string
}

func (o *Options) applyDefaults() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}
	if o.accountAppDir == "" {
		o.accountAppDir = accountutils.GetAccountDir(o.AppDir, o.AccountID)
	}
	if o.accountSharedDir == "" {
		o.accountSharedDir = accountutils.GetAccountDir(o.SharedDir, o.AccountID)
	}
}

type migration struct {
	From  string
	To    string
	Apply func(Options) error
}

var allMigrations = []migration{
	migration0To1,
}

func MigrateToLatest(opts Options) error {
	opts.applyDefaults()

	// apply migrations until there is no next left
	for {
		version, err := migrationutils.GetDataVersion(opts.accountAppDir)
		if err != nil {
			return errcode.ErrCode_TODO.Wrap(err)
		}

		{
			found := false

			// find and apply the next migration, this could be optimized by a map lookup
			for _, m := range allMigrations {
				if version != m.From {
					continue
				}

				opts.Logger.Info("migrating account data", zap.String("account-id", opts.AccountID), zap.String("from", version), zap.String("to", m.To))

				if err := m.Apply(opts); err != nil {
					return errcode.ErrCode_TODO.Wrap(err)
				}

				found = true
				break
			}

			if !found {
				return nil
			}
		}
	}
}
