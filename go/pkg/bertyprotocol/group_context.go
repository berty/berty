package bertyprotocol

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync/atomic"

	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type GroupContext struct {
	ctx             context.Context
	cancel          context.CancelFunc
	group           *protocoltypes.Group
	metadataStore   *MetadataStore
	messageStore    *MessageStore
	messageKeystore *cryptoutil.MessageKeystore
	memberDevice    *cryptoutil.OwnMemberDevice
	logger          *zap.Logger
	valid           uint32
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

	gc.cancel()

	atomic.StoreUint32(&gc.valid, 0)

	return nil
}

func (gc *GroupContext) IsValid() bool {
	return atomic.LoadUint32(&gc.valid) != 0
}

func NewContextGroup(ctx context.Context, cancel context.CancelFunc, group *protocoltypes.Group, metadataStore *MetadataStore, messageStore *MessageStore, messageKeystore *cryptoutil.MessageKeystore, memberDevice *cryptoutil.OwnMemberDevice, logger *zap.Logger) *GroupContext {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &GroupContext{
		ctx:             ctx,
		cancel:          cancel,
		group:           group,
		metadataStore:   metadataStore,
		messageStore:    messageStore,
		messageKeystore: messageKeystore,
		memberDevice:    memberDevice,
		logger:          logger.With(logutil.PrivateString("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(group.PublicKey)))),
	}
}
