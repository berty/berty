package bertyprotocol

import (
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type groupContext struct {
	group           *bertytypes.Group
	metadataStore   *metadataStore
	messageStore    *messageStore
	messageKeystore *MessageKeystore
	memberDevice    *ownMemberDevice
}

func (c *groupContext) MessageKeystore() *MessageKeystore {
	return c.messageKeystore
}

func (c *groupContext) getMemberPrivKey() crypto.PrivKey {
	return c.memberDevice.member
}

func (c *groupContext) MessageStore() *messageStore {
	return c.messageStore
}

func (c *groupContext) MetadataStore() *metadataStore {
	return c.metadataStore
}

func (c *groupContext) Group() *bertytypes.Group {
	return c.group
}

func (c *groupContext) MemberPubKey() crypto.PubKey {
	return c.memberDevice.member.GetPublic()
}

func (c *groupContext) DevicePubKey() crypto.PubKey {
	return c.memberDevice.device.GetPublic()
}

func (c *groupContext) Close() error {
	c.metadataStore.Close()
	c.messageStore.Close()

	return nil
}

func newContextGroup(group *bertytypes.Group, metadataStore *metadataStore, messageStore *messageStore, messageKeystore *MessageKeystore, memberDevice *ownMemberDevice) *groupContext {
	return &groupContext{
		group:           group,
		metadataStore:   metadataStore,
		messageStore:    messageStore,
		messageKeystore: messageKeystore,
		memberDevice:    memberDevice,
	}
}
