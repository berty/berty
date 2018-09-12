package node

import (
	"berty.tech/core/entity"
	"github.com/pkg/errors"
)

func (n *Node) RegisterDevice(device *entity.Device) error {
	err := n.sigchain.AddDevice(n.crypto, string(n.pubkey), device.ID, []byte(device.ID))

	if err != nil {
		return errors.Wrap(err, "unable to add device to sigchain")
	}

	return n.persistSigChain()
}

func (n *Node) RevokeDevice(device *entity.Device) error {
	// TODO: implement
	return errors.New("unimplemented")

	//return n.persistSigChain()
}

func (n *Node) persistSigChain() error {
	data, err := n.sigchain.Marshal()

	if err != nil {
		return errors.Wrap(err, "unable to serialize sigchain")
	}

	n.config.Myself.Sigchain = data

	return n.sql.Save(n.config.Myself).Error
}
