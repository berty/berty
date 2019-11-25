package orbitutil

import (
	"context"

	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
	"berty.tech/go/internal/group"
	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
)

type MemberStore interface {
	iface.Store

	// ListMembers gets the list of the devices of the group
	ListMembers() ([]*group.MemberDevice, error)

	// RedeemInvitation add a device to the list of the members of the group
	RedeemInvitation(ctx context.Context, memberPrivateKey crypto.PrivKey, devicePrivateKey crypto.PrivKey, invitation *group.Invitation) (operation.Operation, error)
}

type memberStore struct {
	basestore.BaseStore

	group *group.Group
}

func (m *memberStore) ListMembers() ([]*group.MemberDevice, error) {
	values, ok := m.Index().Get("").([]*group.MemberDevice)
	if !ok {
		return nil, errors.New("unable to cast entries")
	}

	return values, nil
}

func (m *memberStore) RedeemInvitation(ctx context.Context, memberPrivateKey, devicePrivateKey crypto.PrivKey, invitation *group.Invitation) (operation.Operation, error) {
	payload, err := group.NewMemberEntryPayload(memberPrivateKey, devicePrivateKey, invitation)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	env, err := group.SealStorePayload(payload, m.group, devicePrivateKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op := operation.NewOperation(nil, "ADD", env)

	e, err := m.AddOperation(ctx, op, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op, err = operation.ParseOperation(e)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return op, nil
}

var _ MemberStore = (*memberStore)(nil)
