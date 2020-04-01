package bertyprotocol

import (
	"encoding/base64"
	"fmt"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
)

type groupContext struct {
	group           *bertytypes.Group
	metadataStore   *metadataStore
	messageStore    *messageStore
	messageKeystore *MessageKeystore
	memberDevice    *ownMemberDevice
	logger          *zap.Logger
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

func newContextGroup(group *bertytypes.Group, metadataStore *metadataStore, messageStore *messageStore, messageKeystore *MessageKeystore, memberDevice *ownMemberDevice, logger *zap.Logger) *groupContext {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &groupContext{
		group:           group,
		metadataStore:   metadataStore,
		messageStore:    messageStore,
		messageKeystore: messageKeystore,
		memberDevice:    memberDevice,
		logger:          logger.With(zap.String("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(group.PublicKey)))),
	}
}
