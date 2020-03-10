package orbitutil

import (
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/account"
	"berty.tech/berty/go/internal/bertycrypto"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type contextGroup struct {
	group         *bertyprotocol.Group
	metadataStore *MetadataStoreImpl
	messageStore  *MessageStoreImpl
	messageKeys   bertycrypto.MessageKeys
	memberDevice  *account.OwnMemberDevice
}

func (c *contextGroup) getMessageKeys() bertycrypto.MessageKeys {
	return c.messageKeys
}

func (c *contextGroup) getDevicePrivKey() crypto.PrivKey {
	return c.memberDevice.Device
}

func (c *contextGroup) getMemberPrivKey() crypto.PrivKey {
	return c.memberDevice.Member
}

func (c *contextGroup) MessageStore() MessageStore {
	return c.messageStore
}

func (c *contextGroup) MetadataStore() MetadataStore {
	return c.metadataStore
}

func (c *contextGroup) Group() *bertyprotocol.Group {
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

func NewContextGroup(group *bertyprotocol.Group, metadataStore *MetadataStoreImpl, messageStore *MessageStoreImpl, messageKeys bertycrypto.MessageKeys, memberDevice *account.OwnMemberDevice) ContextGroup {
	return &contextGroup{
		group:         group,
		metadataStore: metadataStore,
		messageStore:  messageStore,
		messageKeys:   messageKeys,
		memberDevice:  memberDevice,
	}
}
