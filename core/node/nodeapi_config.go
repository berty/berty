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
	n.config.PushRelayPubkeyAPNS = input.PushRelayPubkeyAPNS
	n.config.PushRelayPubkeyFCM = input.PushRelayPubkeyFCM

	if err := n.sql(ctx).Save(n.config).Error; err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	return n.config, nil
}
