package bertyprotocol

import (
	"context"
	"encoding/base64"
	"fmt"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (s *service) ReplicationServiceRegisterGroup(ctx context.Context, request *protocoltypes.ReplicationServiceRegisterGroup_Request) (_ *protocoltypes.ReplicationServiceRegisterGroup_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Registering replication service for group")
	defer func() { endSection(err, "") }()

	gc, err := s.getContextGroupForID(request.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	replGroup, err := gc.group.FilterForReplication()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	token, err := s.accountGroup.metadataStore.getServiceToken(request.TokenID)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if token == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid token"))
	}

	endpoint := ""
	for _, t := range token.SupportedServices {
		if t.ServiceType != ServiceReplicationID {
			continue
		}

		endpoint = t.ServiceEndpoint
		break
	}

	if endpoint == "" {
		return nil, errcode.ErrServiceReplicationMissingEndpoint
	}

	cc, err := grpc.Dial(endpoint, []grpc.DialOption{
		grpc.WithPerRPCCredentials(grpcutil.NewUnsecureSimpleAuthAccess("bearer", token.Token)),
		grpc.WithInsecure(), // TODO: remove this, enforce security
	}...)
	if err != nil {
		return nil, errcode.ErrStreamWrite.Wrap(err)
	}

	client := NewReplicationServiceClient(cc)

	if _, err = client.ReplicateGroup(ctx, &protocoltypes.ReplicationServiceReplicateGroup_Request{
		Group: replGroup,
	}); err != nil {
		return nil, errcode.ErrServiceReplicationServer.Wrap(err)
	}

	s.logger.Info("group will be replicated", zap.String("public-key", base64.RawURLEncoding.EncodeToString(request.GroupPK)))

	if _, err := gc.metadataStore.SendGroupReplicating(ctx, token, endpoint); err != nil {
		s.logger.Error("error while notifying group about replication", zap.Error(err))
	}

	return &protocoltypes.ReplicationServiceRegisterGroup_Reply{}, nil
}
