package bertyprotocol

import (
	"context"
	"fmt"

	ds "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-datastore/query"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const (
	serviceReplicationKeyGroupPrefix = "group"
	ServiceReplicationID             = "rpl"
)

type replicationService struct {
	odb    *BertyOrbitDB
	ds     ds.Datastore
	logger *zap.Logger
	ctx    context.Context
}

func (s *replicationService) GroupRegister(token string, group *protocoltypes.Group) error {
	data, err := group.Marshal()
	if err != nil {
		s.logger.Error("error while marshaling request", zap.Error(err))
		return err
	}

	if err := s.ds.Put(ds.KeyWithNamespaces([]string{serviceReplicationKeyGroupPrefix, token, string(group.PublicKey)}), data); err != nil {
		s.logger.Error("error while registering group", zap.Error(err))
		return err
	}

	s.logger.Info("registering group", zap.Binary("group_pk", group.PublicKey))

	return s.GroupSubscribe(group)
}

func (s *replicationService) GroupSubscribe(group *protocoltypes.Group) error {
	return s.odb.openGroupReplication(s.ctx, group, nil)
}

func (s *replicationService) ReplicateGroup(_ context.Context, req *protocoltypes.ReplicationServiceReplicateGroup_Request) (*protocoltypes.ReplicationServiceReplicateGroup_Reply, error) {
	// TODO: retrieve auth token
	err := s.GroupRegister("TODO", req.Group)

	return &protocoltypes.ReplicationServiceReplicateGroup_Reply{}, err
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

func NewReplicationService(ctx context.Context, store ds.Datastore, odb *BertyOrbitDB, logger *zap.Logger) (ReplicationService, error) {
	if store == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("store should not be nil"))
	}

	if odb == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("odb should not be nil"))
	}

	if logger == nil {
		logger = zap.NewNop()
	}

	r := &replicationService{
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
		group := &protocoltypes.Group{}
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

type ReplicationClient interface {
	ReplicationServiceClient

	Close() error
}
