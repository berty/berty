package bertyprotocol

import (
	"context"
	"encoding/json"
	"sync"

	cid "github.com/ipfs/go-cid"
	mh "github.com/multiformats/go-multihash"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	logac "berty.tech/go-ipfs-log/accesscontroller"
	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/accesscontroller"
	"berty.tech/go-orbit-db/iface"
)

type simpleAccessController struct {
	allowedKeys map[string][]string
	logger      *zap.Logger
	lock        sync.RWMutex
}

func (o *simpleAccessController) SetLogger(logger *zap.Logger) {
	o.lock.Lock()
	defer o.lock.Unlock()

	o.logger = logger
}

func (o *simpleAccessController) Logger() *zap.Logger {
	o.lock.RLock()
	defer o.lock.RUnlock()

	return o.logger
}

func (o *simpleAccessController) Grant(ctx context.Context, capability string, keyID string) error {
	return nil
}

func (o *simpleAccessController) Revoke(ctx context.Context, capability string, keyID string) error {
	return nil
}

func (o *simpleAccessController) Load(ctx context.Context, address string) error {
	return nil
}

func simpleAccessControllerCID(allowedKeys map[string][]string) (cid.Cid, error) {
	d, err := json.Marshal(allowedKeys)
	if err != nil {
		return cid.Undef, errcode.ErrInvalidInput.Wrap(err)
	}

	c, err := cid.Prefix{
		Version:  1,
		Codec:    cid.Raw,
		MhType:   mh.SHA2_256,
		MhLength: -1,
	}.Sum(d)
	if err != nil {
		return cid.Undef, errcode.ErrInvalidInput.Wrap(err)
	}

	return c, nil
}

func (o *simpleAccessController) Save(ctx context.Context) (accesscontroller.ManifestParams, error) {
	c, err := simpleAccessControllerCID(o.allowedKeys)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return accesscontroller.NewManifestParams(c, true, "simple"), nil
}

func (o *simpleAccessController) Close() error {
	return nil
}

func (o *simpleAccessController) Type() string {
	return "bertysimple"
}

func (o *simpleAccessController) GetAuthorizedByRole(role string) ([]string, error) {
	return o.allowedKeys[role], nil
}

func (o *simpleAccessController) CanAppend(e logac.LogEntry, p identityprovider.Interface, additionalContext accesscontroller.CanAppendAdditionalContext) error {
	for _, id := range o.allowedKeys["write"] {
		if e.GetIdentity().ID == id || id == "*" {
			return nil
		}
	}

	return errors.New("not allowed to write entry")
}

// NewSimpleAccessController Returns a non configurable access controller
func NewSimpleAccessController(_ context.Context, _ iface.BaseOrbitDB, params accesscontroller.ManifestParams, options ...accesscontroller.Option) (accesscontroller.Interface, error) {
	if params == nil {
		return &simpleAccessController{}, errors.New("an options object is required")
	}

	ac := &simpleAccessController{
		allowedKeys: params.GetAllAccess(),
	}

	for _, o := range options {
		o(ac)
	}

	return ac, nil
}

var _ accesscontroller.Interface = &simpleAccessController{}
