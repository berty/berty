package node

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	"github.com/pkg/errors"
)

func (n *Node) RegisterDevice(ctx context.Context, device *entity.Device) error {
	tracer := tracing.EnterFunc(ctx, device)
	defer tracer.Finish()
	ctx = tracer.Context()

	err := n.sigchain.AddDevice(n.crypto, n.pubkey, []byte(device.ID), []byte(device.ID))

	if err != nil {
		return errors.Wrap(err, "unable to add device to sigchain")
	}

	return n.persistSigChain(ctx)
}

func (n *Node) RevokeDevice(ctx context.Context, device *entity.Device) error {
	tracer := tracing.EnterFunc(ctx, device)
	defer tracer.Finish()
	// ctx = tracer.Context()

	// TODO: implement
	return errors.New("unimplemented")
	//return n.persistSigChain()
}

func (n *Node) persistSigChain(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	data, err := n.sigchain.Marshal()
	if err != nil {
		return errors.Wrap(err, "unable to serialize sigchain")
	}

	n.config.Myself.Sigchain = data

	sql := n.sql(ctx)
	return sql.Save(n.config.Myself).Error
}
