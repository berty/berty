package bertyprotocol

import (
	"encoding/base64"
	"fmt"

	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type GroupContext struct {
	group           *protocoltypes.Group
	metadataStore   *MetadataStore
	messageStore    *MessageStore
	messageKeystore *cryptoutil.MessageKeystore
	memberDevice    *cryptoutil.OwnMemberDevice
	logger          *zap.Logger
}

func (gc *GroupContext) MessageKeystore() *cryptoutil.MessageKeystore {
	return gc.messageKeystore
}

func (gc *GroupContext) getMemberPrivKey() crypto.PrivKey {
	return gc.memberDevice.PrivateMember()
}

func (gc *GroupContext) MessageStore() *MessageStore {
	return gc.messageStore
}

func (gc *GroupContext) MetadataStore() *MetadataStore {
	return gc.metadataStore
}

func (gc *GroupContext) Group() *protocoltypes.Group {
	return gc.group
}

func (gc *GroupContext) MemberPubKey() crypto.PubKey {
	return gc.memberDevice.PrivateMember().GetPublic()
}

func (gc *GroupContext) DevicePubKey() crypto.PubKey {
	return gc.memberDevice.PrivateDevice().GetPublic()
}

func (gc *GroupContext) Close() error {
	gc.metadataStore.Close()
	gc.messageStore.Close()

	return nil
}

func NewContextGroup(group *protocoltypes.Group, metadataStore *MetadataStore, messageStore *MessageStore, messageKeystore *cryptoutil.MessageKeystore, memberDevice *cryptoutil.OwnMemberDevice, logger *zap.Logger) *GroupContext {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &GroupContext{
		group:           group,
		metadataStore:   metadataStore,
		messageStore:    messageStore,
		messageKeystore: messageKeystore,
		memberDevice:    memberDevice,
		logger:          logger.With(logutil.PrivateString("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(group.PublicKey)))),
	}
}
