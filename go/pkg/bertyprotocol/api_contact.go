package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

func (c *client) ContactAliasKeySend(context.Context, *ContactAliasKeySend_Request) (*ContactAliasKeySend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactBlock(context.Context, *ContactBlock_Request) (*ContactBlock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactUnblock(context.Context, *ContactUnblock_Request) (*ContactUnblock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
