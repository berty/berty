package bertyprotocol

import (
	"context"

	ds "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-datastore/query"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertytypes"
)

const serviceReplicationKeyGroupPrefix = "group"
const ServiceReplicationID = "rpl"

type ReplicationManager struct {
	odb    *BertyOrbitDB
	ds     ds.Datastore
	logger *zap.Logger
	ctx    context.Context
}

func (r *ReplicationManager) RegisterGroup(token string, group *bertytypes.ReplicationGroup) error {
	data, err := group.Marshal()
	if err != nil {
		r.logger.Error("error while marshaling request", zap.Error(err))
		return err
	}

	if err := r.ds.Put(ds.KeyWithNamespaces([]string{serviceReplicationKeyGroupPrefix, token, string(group.PubKey)}), data); err != nil {
		r.logger.Error("error while registering group", zap.Error(err))
		return err
	}

	return r.GroupSubscribe(group)
}

func (r *ReplicationManager) GroupSubscribe(group *bertytypes.ReplicationGroup) error {
	return r.odb.openGroupReplication(r.ctx, group.ToGroup(), nil)
}

func (r *ReplicationManager) Close() error {
	return nil
}

func NewReplicationManager(ctx context.Context, store ds.Datastore, odb *BertyOrbitDB, logger *zap.Logger) (*ReplicationManager, error) {
	r := &ReplicationManager{
		ctx:    ctx,
		logger: logger,
		odb:    odb,
		ds:     store,
	}

	res, err := store.Query(query.Query{Prefix: serviceReplicationKeyGroupPrefix})
	if err != nil {
		_ = r.Close()
		return nil, err
	}

	for data := range res.Next() {
		group := &bertytypes.ReplicationGroup{}
		if err := group.Unmarshal(data.Value); err != nil {
			logger.Error("unable to unmarshal group data", zap.Error(err))
			continue
		}

		if err := r.GroupSubscribe(group); err != nil {
			logger.Error("unable to subscribe to group updates", zap.Error(err))
			continue
		}
	}

	return r, nil
}

type replicationService struct {
	replicationManager *ReplicationManager
}

func (s *replicationService) ReplicateGroup(ctx context.Context, req *bertytypes.ReplicationServiceReplicateGroup_Request) (*bertytypes.ReplicationServiceReplicateGroup_Reply, error) {
	// TODO: retrieve auth token
	err := s.replicationManager.RegisterGroup("TODO", req.Group)

	return &bertytypes.ReplicationServiceReplicateGroup_Reply{}, err
}

func (s *replicationService) Close() error {
	return nil
}

var _ ReplicationService = (*replicationService)(nil)

// Service is the main Berty Protocol interface
type ReplicationService interface {
	ReplicationServiceServer

	Close() error
}

func NewReplicationService(replicationManager *ReplicationManager) ReplicationService {
	return &replicationService{
		replicationManager: replicationManager,
	}
}
