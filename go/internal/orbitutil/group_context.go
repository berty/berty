package orbitutil

import (
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/account"
	"berty.tech/berty/go/internal/bertycrypto"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type GroupContext struct {
	group         *bertyprotocol.Group
	metadataStore MetadataStore
	messageStore  MessageStore
	messageKeys   bertycrypto.MessageKeys
	memberDevice  *account.OwnMemberDevice
}

func (g *GroupContext) MessageStore() MessageStore {
	return g.messageStore
}

func (g *GroupContext) MetadataStore() MetadataStore {
	return g.metadataStore
}

func (g *GroupContext) Group() *bertyprotocol.Group {
	return g.group
}

func (g *GroupContext) MemberPubKey() crypto.PubKey {
	return g.memberDevice.Member.GetPublic()
}

func (g *GroupContext) DevicePubKey() crypto.PubKey {
	return g.memberDevice.Device.GetPublic()
}

func (g *GroupContext) Close() error {
	g.metadataStore.Close()
	g.messageStore.Close()

	return nil
}

func NewGroupContext(group *bertyprotocol.Group, metadataStore MetadataStore, messageStore MessageStore, messageKeys bertycrypto.MessageKeys, memberDevice *account.OwnMemberDevice) *GroupContext {
	return &GroupContext{
		group:         group,
		metadataStore: metadataStore,
		messageStore:  messageStore,
		messageKeys:   messageKeys,
		memberDevice:  memberDevice,
	}
}
