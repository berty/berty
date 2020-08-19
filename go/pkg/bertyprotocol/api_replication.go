package bertyprotocol

import (
	"context"
	"fmt"

	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) ReplicationServiceRegisterGroup(ctx context.Context, request *bertytypes.ReplicationServiceRegisterGroup_Request) (*bertytypes.ReplicationServiceRegisterGroup_Reply, error) {
	s.lock.RLock()
	group, ok := s.groups[string(request.GroupPK)]
	s.lock.RUnlock()

	if !ok {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("group not found"))
	}

	groupSigPK, err := group.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	groupSigPKBytes, err := groupSigPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	token, err := s.accountGroup.metadataStore.getReplicationToken(request.TokenID)
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
		return nil, errcode.ErrServiceReplication.Wrap(fmt.Errorf("TODO: errcode.ErrServiceReplicationNotSupported"))
	}

	cc, err := grpc.Dial(endpoint, []grpc.DialOption{
		// grpc.WithPerRPCCredentials(oauth.NewOauthAccess(&oauth2.Token{
		// 	AccessToken: token.Token,
		// })),
		grpc.WithInsecure(), // TODO: remove this, enforce security
	}...)
	if err != nil {
		return nil, errcode.ErrStreamWrite.Wrap(err)
	}

	client := NewReplicationServiceClient(cc)

	if _, err = client.ReplicateGroup(ctx, &bertytypes.ReplicationServiceReplicateGroup_Request{
		Group: &bertytypes.ReplicationGroup{
			PubKey:    request.GroupPK,
			SigPubKey: groupSigPKBytes,
		},
	}); err != nil {
		return nil, errcode.ErrServiceReplicationServer.Wrap(err)
	}

	// TODO: send event to group informing we are now
	//  replicating its data somewhere?

	return &bertytypes.ReplicationServiceRegisterGroup_Reply{}, nil
}
