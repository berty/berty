package node

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	opentracing "github.com/opentracing/opentracing-go"
	"github.com/pkg/errors"
)

func (n *Node) RegisterDevice(ctx context.Context, device *entity.Device) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, device)
	defer span.Finish()

	err := n.sigchain.AddDevice(n.crypto, n.pubkey, []byte(device.ID), []byte(device.ID))

	if err != nil {
		return errors.Wrap(err, "unable to add device to sigchain")
	}

	return n.persistSigChain(ctx)
}

func (n *Node) RevokeDevice(ctx context.Context, device *entity.Device) error {
	span, _ := tracing.EnterFunc(ctx, device)
	defer span.Finish()

	// TODO: implement
	return errors.New("unimplemented")
	//return n.persistSigChain()
}

func (n *Node) persistSigChain(ctx context.Context) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx)
	defer span.Finish()

	data, err := n.sigchain.Marshal()
	if err != nil {
		return errors.Wrap(err, "unable to serialize sigchain")
	}

	n.config.Myself.Sigchain = data

	sql := n.sql(ctx)
	return sql.Save(n.config.Myself).Error
}
