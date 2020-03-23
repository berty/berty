package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

func (c *service) ContactAliasKeySend(context.Context, *ContactAliasKeySend_Request) (*ContactAliasKeySend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *service) ContactBlock(context.Context, *ContactBlock_Request) (*ContactBlock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *service) ContactUnblock(context.Context, *ContactUnblock_Request) (*ContactUnblock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
