package node

import "berty.tech/core/entity"

func WithDevice(device *entity.Device) NewNodeOption {
	return func(n *Node) {
		n.initDevice = device
	}
}
