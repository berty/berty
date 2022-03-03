package bertyreplication

import (
	"context"
	"crypto/ed25519"
	"fmt"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/replicationtypes"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
)

type BertyOrbitDB interface {
	OpenGroupReplication(ctx context.Context, g *protocoltypes.Group, options *orbitdb.CreateDBOptions) (iface.Store, iface.Store, error)
	IsGroupLoaded(groupID string) bool
}

type replicationService struct {
	odb       BertyOrbitDB
	logger    *zap.Logger
	ctx       context.Context
	db        *gorm.DB
	startedAt time.Time
}

func (s *replicationService) ReplicateGlobalStats(ctx context.Context, request *replicationtypes.ReplicateGlobalStats_Request) (*replicationtypes.ReplicateGlobalStats_Reply, error) {
	ret := &replicationtypes.ReplicateGlobalStats_Reply{}

	if err := s.db.Raw("SELECT COUNT(public_key) AS replicated_groups, SUM(metadata_entries_count) AS total_metadata_entries, SUM(message_entries_count) AS total_message_entries FROM replicated_groups").Scan(&ret).Error; err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	ret.StartedAt = s.startedAt.UnixNano()

	return ret, nil
}

func (s *replicationService) ReplicateGroupStats(ctx context.Context, request *replicationtypes.ReplicateGroupStats_Request) (*replicationtypes.ReplicateGroupStats_Reply, error) {
	if len(request.GroupPublicKey) == 0 {
		return nil, errcode.ErrNotFound
	}

	g := &replicationtypes.ReplicatedGroup{}
	if err := s.db.Model(&replicationtypes.ReplicatedGroup{}).Where("public_key = ?", request.GroupPublicKey).First(&g).Error; err != nil {
		return nil, errcode.ErrNotFound
	}

	g.SignPub = ""
	g.LinkKey = ""

	return &replicationtypes.ReplicateGroupStats_Reply{Group: g}, nil
}

func (s *replicationService) GroupRegister(token, tokenIssuer string, group *protocoltypes.Group) error {
	if token == "" {
		return errcode.ErrServiceReplication.Wrap(fmt.Errorf("missing token"))
	}

	if tokenIssuer == "" {
		return errcode.ErrServiceReplication.Wrap(fmt.Errorf("missing token issuer"))
	}

	pkStr := messengerutil.B64EncodeBytes(group.PublicKey)
	linkKeyStr := messengerutil.B64EncodeBytes(group.LinkKey)

	if err := s.db.Transaction(func(tx *gorm.DB) error {
		count := int64(0)

		if err := tx.Model(&replicationtypes.ReplicatedGroupToken{}).Where(&replicationtypes.ReplicatedGroupToken{
			ReplicatedGroupPublicKey: pkStr,
			TokenID:                  token,
		}).Count(&count).Error; err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if count == 1 {
			return errcode.ErrDBEntryAlreadyExists
		}

		if err := tx.Model(&replicationtypes.ReplicatedGroup{}).Where(&replicationtypes.ReplicatedGroup{
			PublicKey: pkStr,
		}).Count(&count).Error; err != nil {
			return err
		}

		if count == 0 {
			tx.Model(&replicationtypes.ReplicatedGroup{}).Create(&replicationtypes.ReplicatedGroup{
				PublicKey: pkStr,
				SignPub:   messengerutil.B64EncodeBytes(group.SignPub),
				LinkKey:   linkKeyStr,
				CreatedAt: time.Now().UnixNano(),
				UpdatedAt: time.Now().UnixNano(),
			})
		}

		tx.Model(&replicationtypes.ReplicatedGroupToken{}).Create(&replicationtypes.ReplicatedGroupToken{
			ReplicatedGroupPublicKey: pkStr,
			CreatedAt:                time.Now().UnixNano(),
			TokenID:                  token,
			TokenIssuer:              tokenIssuer,
		})

		if err := s.GroupSubscribe(group, pkStr); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	return nil
}

func (s *replicationService) GroupSubscribe(group *protocoltypes.Group, pkStr string) error {
	metadataStore, messageStore, err := s.odb.OpenGroupReplication(s.ctx, group, nil)
	if err != nil {
		return err
	}

	subMetadata, err := metadataStore.EventBus().Subscribe(new(stores.EventReplicated))
	if err != nil {
		return fmt.Errorf("unable to subscribe to metadata store events")
	}

	subMessage, err := messageStore.EventBus().Subscribe(new(stores.EventReplicated))
	if err != nil {
		return fmt.Errorf("unable to subscribe to message store events")
	}

	go func() {
		defer subMetadata.Close()
		defer subMessage.Close()

		// @FIXME(gfanton): update group db should be run inside a goroutine to avoid channel to be stuck
		for {
			select {
			case <-subMetadata.Out():
				s.updateGroupDB(metadataStore, pkStr, updatedMetaStore)
			case <-subMessage.Out():
				s.updateGroupDB(messageStore, pkStr, updatedMessageStore)
			case <-s.ctx.Done():
				return
			}
		}
	}()

	return nil
}

type groupInfoUpdatedStore int32

const (
	updatedMetaStore groupInfoUpdatedStore = iota
	updatedMessageStore
)

func (s *replicationService) updateGroupDB(store iface.Store, groupPK string, field groupInfoUpdatedStore) {
	if err := s.db.Transaction(func(tx *gorm.DB) error {
		qb := tx.Model(&replicationtypes.ReplicatedGroup{}).Where("public_key = ?", groupPK)

		replicatedGroup := &replicationtypes.ReplicatedGroup{}
		if err := qb.First(&replicatedGroup).Error; err != nil {
			return err
		}

		opsCount := int64(store.OpLog().Len())
		if opsCount == 0 {
			return errcode.ErrInvalidInput
		}

		if store.OpLog().RawHeads().Len() == 0 {
			return errcode.ErrInvalidInput
		}

		head := store.OpLog().RawHeads().Slice()[0]
		updates := map[string]interface{}{}

		switch field {
		case updatedMessageStore:
			if opsCount >= replicatedGroup.MessageEntriesCount {
				updates["message_entries_count"] = opsCount
				updates["message_latest_head"] = head.GetHash().String()
			}

		case updatedMetaStore:
			if opsCount >= replicatedGroup.MetadataEntriesCount {
				updates["metadata_entries_count"] = opsCount
				updates["metadata_latest_head"] = head.GetHash().String()
			}

		default:
			return errcode.ErrInvalidInput.Wrap(fmt.Errorf("unrecognized store type"))
		}

		updates["updated_at"] = time.Now().UnixNano()

		return qb.Updates(updates).Error
	}); err != nil {
		s.logger.Error("error while performing db op", zap.Error(err))
	}
}

func (s *replicationService) ReplicateGroup(ctx context.Context, req *replicationtypes.ReplicationServiceReplicateGroup_Request) (*replicationtypes.ReplicationServiceReplicateGroup_Reply, error) {
	token := ctx.Value(authtypes.ContextTokenHashField)
	if token == nil {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInternal.Wrap(fmt.Errorf("no token found"))
	}

	if len(req.Group.SignPub) != ed25519.PublicKeySize {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing sign pub"))
	}

	if len(req.Group.PublicKey) != ed25519.PublicKeySize {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing public key"))
	}

	if len(req.Group.LinkKey) == 0 {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing link key"))
	}

	if len(req.Group.LinkKeySig) != ed25519.SignatureSize {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing link key signature"))
	}

	if ok := ed25519.Verify(req.Group.PublicKey, req.Group.LinkKey, req.Group.LinkKeySig); !ok {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrCryptoSignatureVerification.Wrap(fmt.Errorf("invalid link key"))
	}

	tokenIssuer := ctx.Value(authtypes.ContextTokenIssuerField)
	if tokenIssuer == nil {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInternal.Wrap(fmt.Errorf("no token issuer found"))
	}

	if _, ok := token.(string); !ok {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInternal.Wrap(fmt.Errorf("invalid type for token value"))
	}

	if _, ok := tokenIssuer.(string); !ok {
		return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, errcode.ErrInternal.Wrap(fmt.Errorf("invalid type for token issuer value"))
	}

	err := s.GroupRegister(token.(string), tokenIssuer.(string), req.Group)

	return &replicationtypes.ReplicationServiceReplicateGroup_Reply{}, err
}

func (s *replicationService) OrbitDB() BertyOrbitDB {
	return s.odb
}

func (s *replicationService) Close() error {
	return nil
}

var _ ReplicationService = (*replicationService)(nil)

type ReplicationService interface {
	replicationtypes.ReplicationServiceServer

	Close() error
}

func NewReplicationService(ctx context.Context, db *gorm.DB, odb BertyOrbitDB, logger *zap.Logger) (ReplicationService, error) {
	if db == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("db should not be nil"))
	}

	if odb == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("odb should not be nil"))
	}

	if logger == nil {
		logger = zap.NewNop()
	}

	r := &replicationService{
		ctx:       ctx,
		logger:    logger,
		odb:       odb,
		db:        db,
		startedAt: time.Now(),
	}

	// Create/migrate models in DB
	if err := db.AutoMigrate(&replicationtypes.ReplicatedGroup{}, &replicationtypes.ReplicatedGroupToken{}); err != nil {
		// TODO: improve migration logic
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	// Resubscribe to known groups
	groups := []replicationtypes.ReplicatedGroup(nil)
	if err := db.Model(&replicationtypes.ReplicatedGroup{}).FindInBatches(&groups, 10, func(tx *gorm.DB, batch int) error {
		for _, group := range groups {
			g, err := group.ToGroup()
			if err != nil {
				return err
			}

			if err := r.GroupSubscribe(g, group.PublicKey); err != nil {
				logger.Error("unable to subscribe to group updates", zap.Error(err))
			}
		}

		return nil
	}).Error; err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	return r, nil
}

type ReplicationClient interface {
	replicationtypes.ReplicationServiceClient

	Close() error
}
