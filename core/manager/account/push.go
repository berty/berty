package account

import (
	"berty.tech/core/push"
)

func WithPushManager(pushManager *push.Manager) NewOption {
	return func(n *Account) error {
		n.pushManager = pushManager

		return nil
	}
}
