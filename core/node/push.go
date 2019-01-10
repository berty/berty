package node

import (
	"berty.tech/core/push"
)

func WithPushManager(pushManager *push.Manager) NewNodeOption {
	return func(n *Node) {
		n.pushManager = pushManager
	}
}
