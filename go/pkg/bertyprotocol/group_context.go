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

func (gc *groupContext) MessageKeystore() *MessageKeystore {
	return gc.messageKeystore
}

func (gc *groupContext) getMemberPrivKey() crypto.PrivKey {
	return gc.memberDevice.member
}

func (gc *groupContext) MessageStore() *messageStore {
	return gc.messageStore
}

func (gc *groupContext) MetadataStore() *metadataStore {
	return gc.metadataStore
}

func (gc *groupContext) Group() *bertytypes.Group {
	return gc.group
}

func (gc *groupContext) MemberPubKey() crypto.PubKey {
	return gc.memberDevice.member.GetPublic()
}

func (gc *groupContext) DevicePubKey() crypto.PubKey {
	return gc.memberDevice.device.GetPublic()
}

func (gc *groupContext) Close() error {
	gc.metadataStore.Close()
	gc.messageStore.Close()

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
