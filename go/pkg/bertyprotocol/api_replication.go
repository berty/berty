package bertyprotocol

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"fmt"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/replicationtypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func FilterGroupForReplication(m *protocoltypes.Group) (*protocoltypes.Group, error) {
	groupSigPK, err := m.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	groupSigPKBytes, err := groupSigPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	linkKey, err := cryptoutil.GetLinkKeyArray(m)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &protocoltypes.Group{
		PublicKey:  m.PublicKey,
		SignPub:    groupSigPKBytes,
		LinkKey:    linkKey[:],
		LinkKeySig: m.LinkKeySig,
	}, nil
}

func (s *service) ReplicationServiceRegisterGroup(ctx context.Context, request *protocoltypes.ReplicationServiceRegisterGroup_Request) (_ *protocoltypes.ReplicationServiceRegisterGroup_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Registering replication service for group")
	defer func() { endSection(err, "") }()

	gc, err := s.GetContextGroupForID(request.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	replGroup, err := FilterGroupForReplication(gc.group)
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
		if t.ServiceType != authtypes.ServiceReplicationID {
			continue
		}

		endpoint = t.ServiceEndpoint
		break
	}

	if endpoint == "" {
		return nil, errcode.ErrServiceReplicationMissingEndpoint
	}

	gopts := []grpc.DialOption{
		grpc.WithPerRPCCredentials(grpcutil.NewUnsecureSimpleAuthAccess("bearer", token.Token)),
	}

	if s.grpcInsecure {
		gopts = append(gopts, grpc.WithInsecure())
	} else {
		tlsconfig := credentials.NewTLS(&tls.Config{
			MinVersion: tls.VersionTLS12,
		})
		gopts = append(gopts, grpc.WithTransportCredentials(tlsconfig))
	}

	cc, err := grpc.DialContext(context.Background(), endpoint, gopts...)
	if err != nil {
		return nil, errcode.ErrStreamWrite.Wrap(err)
	}

	client := replicationtypes.NewReplicationServiceClient(cc)

	if _, err = client.ReplicateGroup(ctx, &replicationtypes.ReplicationServiceReplicateGroup_Request{
		Group: replGroup,
	}); err != nil {
		return nil, errcode.ErrServiceReplicationServer.Wrap(err)
	}

	s.logger.Info("group will be replicated", logutil.PrivateString("public-key", base64.RawURLEncoding.EncodeToString(request.GroupPK)))

	if _, err := gc.metadataStore.SendGroupReplicating(ctx, token, endpoint); err != nil {
		s.logger.Error("error while notifying group about replication", zap.Error(err))
	}

	return &protocoltypes.ReplicationServiceRegisterGroup_Reply{}, nil
}
