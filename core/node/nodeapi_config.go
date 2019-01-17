package node

import (
	"berty.tech/core/api/node"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"context"
)

func (n *Node) ConfigPublic(ctx context.Context, void *node.Void) (*entity.Config, error) {
	return n.config.Filtered(), nil
}

func (n *Node) ConfigUpdate(ctx context.Context, input *entity.Config) (*entity.Config, error) {
	n.config.PushRelayIDAPNS = input.PushRelayIDAPNS
	n.config.PushRelayIDFCM = input.PushRelayIDFCM

	if err := n.sql(ctx).Save(n.config).Error; err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	return n.config, nil
}
