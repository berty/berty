package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

func (c *client) AppMetadataSend(ctx context.Context, req *AppMetadataSend_Request) (*AppMetadataSend_Reply, error) {
	g, err := c.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrMissingGroup.Wrap(err)
	}

	if _, err := g.MetadataStore().SendAppMetadata(ctx, req.Payload); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &AppMetadataSend_Reply{}, nil
}

func (c *client) AppMessageSend(ctx context.Context, req *AppMessageSend_Request) (*AppMessageSend_Reply, error) {
	g, err := c.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrMissingGroup.Wrap(err)
	}

	if _, err := g.MessageStore().AddMessage(ctx, req.Payload); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &AppMessageSend_Reply{}, nil
}
