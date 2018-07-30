package node

import "github.com/berty/berty/core/entity"

func WithDevice(device *entity.Device) NewNodeOption {
	return func(n *Node) {
		n.initDevice = device
	}
}
