package orbitutil

import (
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type contextGroup struct {
	group         *bertytypes.Group
	metadataStore *MetadataStoreImpl
	messageStore  *MessageStoreImpl
	messageKeys   bertyprotocol.MessageKeys
	memberDevice  *bertyprotocol.OwnMemberDevice
}

func (c *contextGroup) GetMessageKeys() bertyprotocol.MessageKeys {
	return c.messageKeys
}

func (c *contextGroup) GetDevicePrivKey() crypto.PrivKey {
	return c.memberDevice.Device
}

func (c *contextGroup) GetMemberPrivKey() crypto.PrivKey {
	return c.memberDevice.Member
}

func (c *contextGroup) MessageStore() bertyprotocol.MessageStore {
	return c.messageStore
}

func (c *contextGroup) MetadataStore() bertyprotocol.MetadataStore {
	return c.metadataStore
}

func (c *contextGroup) Group() *bertytypes.Group {
	return c.group
}

func (c *contextGroup) MemberPubKey() crypto.PubKey {
	return c.memberDevice.Member.GetPublic()
}

func (c *contextGroup) DevicePubKey() crypto.PubKey {
	return c.memberDevice.Device.GetPublic()
}

func (c *contextGroup) Close() error {
	c.metadataStore.Close()
	c.messageStore.Close()

	return nil
}

func NewContextGroup(group *bertytypes.Group, metadataStore *MetadataStoreImpl, messageStore *MessageStoreImpl, messageKeys bertyprotocol.MessageKeys, memberDevice *bertyprotocol.OwnMemberDevice) bertyprotocol.ContextGroup {
	return &contextGroup{
		group:         group,
		metadataStore: metadataStore,
		messageStore:  messageStore,
		messageKeys:   messageKeys,
		memberDevice:  memberDevice,
	}
}
