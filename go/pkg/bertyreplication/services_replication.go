package bertyreplication

import (
	"context"
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
	"berty.tech/go-orbit-db/events"
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

	go func() {
		ch := metadataStore.Subscribe(s.ctx)
		for evt := range ch {
			s.updateGroupDB(evt, metadataStore, pkStr, updatedMetaStore)
		}
	}()

	go func() {
		messageStore.Subscribe(s.ctx)
		ch := messageStore.Subscribe(s.ctx)
		for evt := range ch {
			s.updateGroupDB(evt, messageStore, pkStr, updatedMessageStore)
		}
	}()

	return nil
}

type groupInfoUpdatedStore int32

const (
	updatedMetaStore groupInfoUpdatedStore = iota
	updatedMessageStore
)

func (s *replicationService) updateGroupDB(evt events.Event, store iface.Store, groupPK string, field groupInfoUpdatedStore) {
	_, ok := evt.(*stores.EventReplicated)
	if !ok {
		return
	}

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
