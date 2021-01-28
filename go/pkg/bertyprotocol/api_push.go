package bertyprotocol

import (
	"bytes"
	"context"
	"fmt"
	"sync"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func (s *service) PushReceive(ctx context.Context, request *protocoltypes.PushReceive_Request) (*protocoltypes.PushReceive_Reply, error) {
	return s.pushHandler.PushReceive(request.Payload)
}

func (s *service) PushSend(ctx context.Context, request *protocoltypes.PushSend_Request) (*protocoltypes.PushSend_Reply, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	gc, err := s.getContextGroupForID(request.GroupPublicKey)
	if err != nil {
		return nil, err
	}

	_, c, err := cid.CidFromBytes(request.CID)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	sealedMessageEnvelope, err := gc.messageStore.GetOutOfStoreMessageEnvelope(ctx, c)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	pushTargets, err := s.getPushTargetsByServer(gc, request.GroupMembers)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	wg := sync.WaitGroup{}
	wg.Add(len(pushTargets))

	for serverAddr, pushTokens := range pushTargets {
		go func(serverAddr string, pushTokens []*protocoltypes.PushServiceOpaqueReceiver) {
			defer wg.Done()

			cc, err := grpc.Dial(serverAddr, []grpc.DialOption{
				grpc.WithInsecure(), // TODO: remove this, enforce security
			}...)
			if err != nil {
				s.logger.Error("error while dialing push server", zap.String("push-server", serverAddr), zap.Error(err))
				return
			}

			client := NewPushServiceClient(cc)
			if _, err := client.Send(ctx, &protocoltypes.PushServiceSend_Request{
				Envelope:  sealedMessageEnvelope,
				Priority:  protocoltypes.PushPriorityNormal,
				Receivers: pushTokens,
			}); err != nil {
				s.logger.Error("error while dialing push server", zap.String("push-server", serverAddr), zap.Error(err))
				return
			}
		}(serverAddr, pushTokens)
	}

	wg.Wait()

	return &protocoltypes.PushSend_Reply{}, nil
}

func (s *service) getPushTargetsByServer(gc *groupContext, targetGroupMembers []*protocoltypes.MemberWithDevices) (map[string][]*protocoltypes.PushServiceOpaqueReceiver, error) {
	pushTargets := []*protocoltypes.PushMemberTokenUpdate(nil)
	serverTokens := map[string][]*protocoltypes.PushServiceOpaqueReceiver{}
	targetDevices := []crypto.PubKey(nil)

	if len(targetGroupMembers) == 0 {
		targetDevices = gc.metadataStore.ListOtherMembersDevices()
	} else {
		for _, memberAndDevices := range targetGroupMembers {
			pk, err := crypto.UnmarshalEd25519PublicKey(memberAndDevices.MemberPK)
			if err != nil {
				return nil, errcode.ErrDeserialization.Wrap(err)
			}

			if len(memberAndDevices.DevicePKs) == 0 {
				// If no devices provided push all devices
				devices, err := gc.metadataStore.GetDevicesForMember(pk)
				if err != nil {
					return nil, errcode.ErrInternal.Wrap(err)
				}

				targetDevices = append(targetDevices, devices...)
				continue
			}

			for _, pkB := range memberAndDevices.DevicePKs {
				devPK, err := crypto.UnmarshalEd25519PublicKey(pkB)
				if err != nil {
					return nil, errcode.ErrDeserialization.Wrap(err)
				}

				member, err := gc.metadataStore.GetMemberByDevice(devPK)
				if err != nil {
					s.logger.Warn("error while retrieving member for device", zap.Error(err))
					continue
				}

				if !member.Equals(devPK) {
					s.logger.Warn("device does not belong to member")
					continue
				}

				targetDevices = append(targetDevices, devPK)
			}
		}
	}

	for _, d := range targetDevices {
		pushToken, err := gc.metadataStore.getPushTokenForDevice(d)
		if err != nil {
			s.logger.Info("unable to get push token for device")
			continue
		}

		pushTargets = append(pushTargets, pushToken)
	}

	for _, pushTarget := range pushTargets {
		serverTokens[pushTarget.Server.ServiceAddr] = append(serverTokens[pushTarget.Server.ServiceAddr], &protocoltypes.PushServiceOpaqueReceiver{OpaqueToken: pushTarget.Token})
	}

	return serverTokens, nil
}

func (s *service) PushShareToken(ctx context.Context, request *protocoltypes.PushShareToken_Request) (*protocoltypes.PushShareToken_Reply, error) {
	gc, err := s.getContextGroupForID(request.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	token, err := pushSealTokenForServer(request.Receiver, request.Server)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if _, err := gc.metadataStore.SendPushToken(ctx, token); err != nil {
		return nil, err
	}

	return &protocoltypes.PushShareToken_Reply{}, nil
}

func (s *service) PushSetDeviceToken(ctx context.Context, request *protocoltypes.PushSetDeviceToken_Request) (*protocoltypes.PushSetDeviceToken_Reply, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	if request.Receiver == nil || request.Receiver.TokenType == protocoltypes.PushTokenUndefined {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid push token provided"))
	}

	if currentReceiver := s.accountGroup.metadataStore.getCurrentDevicePushToken(); currentReceiver != nil && bytes.Equal(currentReceiver.Token, request.Receiver.Token) {
		return &protocoltypes.PushSetDeviceToken_Reply{}, nil
	}

	if _, err := s.accountGroup.metadataStore.RegisterDevicePushToken(ctx, request.Receiver); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.PushSetDeviceToken_Reply{}, nil
}

func (s *service) PushSetServer(ctx context.Context, request *protocoltypes.PushSetServer_Request) (*protocoltypes.PushSetServer_Reply, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	if request.Server == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no push server provided"))
	}

	if currentServer := s.accountGroup.metadataStore.getCurrentDevicePushServer(); currentServer != nil &&
		bytes.Equal(currentServer.ServerKey, request.Server.ServerKey) &&
		currentServer.ServiceAddr == request.Server.ServiceAddr {
		return &protocoltypes.PushSetServer_Reply{}, nil
	}

	if _, err := s.accountGroup.metadataStore.RegisterDevicePushServer(ctx, request.Server); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	cachePayload, err := request.Server.Marshal()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if err := s.accountCache.Put(datastore.NewKey(AccountCacheDatastorePushServerPK), cachePayload); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.PushSetServer_Reply{}, nil
}
