package bertymessenger

import (
	"context"
	"crypto/tls"
	"fmt"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/pkg/cryptoutil"
	"berty.tech/weshnet/pkg/logutil"
	"berty.tech/weshnet/pkg/protocoltypes"
)

// getPushTargetsByServer returns a map of push tokens grouped by server address for the given conversation.
// You can specify A list of members and devices in the targetGroupMembers argument to target specific devices.
// If targetGroupMembers is empty, all members of the conversation will be targeted.
// If no devices are provided, all devices of the targeted members will be targeted.
// You cannot provide devices without the members they belong to.
func (svc *service) getPushTargetsByServer(conversationPK string, targetGroupMembers []*messengertypes.MemberWithDevices) (map[string][]*pushtypes.PushServiceOpaqueReceiver, []*messengertypes.MemberWithDevices, error) {
	pushTargets := []*messengertypes.PushMemberToken(nil)
	pushMemberDevicesTargets := []*messengertypes.MemberWithDevices(nil)
	serverTokens := map[string][]*pushtypes.PushServiceOpaqueReceiver{}
	targetDevices := []string(nil)

	if conversationPK == "" {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("conversationPK is required"))
	}

	conversation, err := svc.db.GetConversationByPK(conversationPK)
	if err != nil {
		return nil, nil, errcode.ErrInternal.Wrap(err)
	}

	if len(targetGroupMembers) == 0 {
		switch conversation.Type {
		case messengertypes.Conversation_MultiMemberType:
			members, err := svc.db.GetMembersByConversation(conversationPK)
			if err != nil {
				return nil, nil, errcode.ErrInternal.Wrap(err)
			}

			for _, m := range members {
				// skip local member
				if m.IsMe {
					continue
				}

				localTargetDevices := []string(nil)
				devices, err := svc.db.GetDevicesForMember(conversationPK, m.PublicKey)
				if err != nil {
					svc.logger.Warn("unable to get devices for member", zap.Error(err))
					continue
				}

				for _, device := range devices {
					localTargetDevices = append(localTargetDevices, device.PublicKey)
				}

				pushMemberDevicesTargets = append(pushMemberDevicesTargets, &messengertypes.MemberWithDevices{
					MemberPK:  m.PublicKey,
					DevicePKs: localTargetDevices,
				})

				targetDevices = append(targetDevices, localTargetDevices...)
			}

			if len(targetDevices) == 0 {
				return nil, nil, errcode.ErrInternal.Wrap(fmt.Errorf("no devices found for this conversation"))
			}
		case messengertypes.Conversation_ContactType:
			localTargetDevices := []string(nil)
			contact, err := svc.db.GetContactByConversation(conversation.PublicKey)
			if err != nil {
				return nil, nil, errcode.ErrInternal.Wrap(err)
			}

			devices, err := svc.db.GetDevicesForContact(conversationPK, contact.PublicKey)
			if err != nil {
				return nil, nil, errcode.ErrInternal.Wrap(err)
			}

			for _, device := range devices {
				localTargetDevices = append(localTargetDevices, device.PublicKey)
			}

			pushMemberDevicesTargets = append(pushMemberDevicesTargets, &messengertypes.MemberWithDevices{
				MemberPK:  contact.PublicKey,
				DevicePKs: localTargetDevices,
			})

			targetDevices = append(targetDevices, localTargetDevices...)
		default:
			return nil, nil, errcode.ErrInternal.Wrap(fmt.Errorf("invalid conversation type: %s", conversation.Type))
		}
	} else {
		for _, memberAndDevices := range targetGroupMembers {
			localTargetDevices := []string(nil)
			if memberAndDevices.MemberPK == "" {
				svc.logger.Warn("memberPK is required")
				continue
			}

			devices, err := svc.db.GetDevicesForMember(conversationPK, memberAndDevices.MemberPK)
			if err != nil {
				return nil, nil, errcode.ErrInternal.Wrap(err)
			}

			if len(memberAndDevices.DevicePKs) == 0 {
				// If no devices provided push all devices
				for _, device := range devices {
					localTargetDevices = append(localTargetDevices, device.PublicKey)
				}

				pushMemberDevicesTargets = append(pushMemberDevicesTargets, &messengertypes.MemberWithDevices{
					MemberPK:  memberAndDevices.MemberPK,
					DevicePKs: localTargetDevices,
				})

				targetDevices = append(targetDevices, localTargetDevices...)
				continue
			}

			// check that the devices belong to the member before adding them to the list
			for _, pkB := range memberAndDevices.DevicePKs {
				for i, device := range devices {
					if device.PublicKey == pkB {
						localTargetDevices = append(localTargetDevices, device.PublicKey)
						break
					}
					if i == len(devices)-1 {
						svc.logger.Warn("device not found for member", logutil.PrivateString("device", pkB), logutil.PrivateString("member", memberAndDevices.MemberPK))
					}
				}
			}

			pushMemberDevicesTargets = append(pushMemberDevicesTargets, &messengertypes.MemberWithDevices{
				MemberPK:  memberAndDevices.MemberPK,
				DevicePKs: localTargetDevices,
			})

			targetDevices = append(targetDevices, localTargetDevices...)
		}
	}

	for _, d := range targetDevices {
		pushTokens, err := svc.db.GetPushMemberTokens(conversationPK, d)
		if err != nil {
			svc.logger.Info("unable to get push token for device")
			continue
		}

		pushTargets = append(pushTargets, pushTokens...)
	}

	for _, pushTarget := range pushTargets {
		serverTokens[pushTarget.ServerAddr] = append(serverTokens[pushTarget.ServerAddr], &pushtypes.PushServiceOpaqueReceiver{OpaqueToken: pushTarget.Token})
	}

	return serverTokens, pushMemberDevicesTargets, nil
}

// getPushClient returns a GRPC client to the given push notification server.
func (svc *service) getPushClient(host string) (pushtypes.PushServiceClient, error) {
	svc.muPushClients.Lock()
	defer svc.muPushClients.Unlock()

	if cc, ok := svc.pushClients[host]; ok {
		return pushtypes.NewPushServiceClient(cc), nil
	}

	var creds grpc.DialOption
	if svc.grpcInsecure {
		creds = grpc.WithTransportCredentials(insecure.NewCredentials())
	} else {
		tlsconfig := credentials.NewTLS(&tls.Config{
			MinVersion: tls.VersionTLS12,
		})
		creds = grpc.WithTransportCredentials(tlsconfig)
	}

	// retry policies
	connectParams := grpc.WithConnectParams(grpc.ConnectParams{
		Backoff: backoff.Config{
			BaseDelay:  1.0 * time.Second,
			Multiplier: 1.5,
			Jitter:     0.2,
			MaxDelay:   60 * time.Second,
		},
		MinConnectTimeout: time.Second * 10,
	})

	cc, err := grpc.DialContext(svc.ctx, host, creds, connectParams)
	if err != nil {
		return nil, err
	}
	svc.pushClients[host] = cc

	return pushtypes.NewPushServiceClient(cc), err
}

// pushDeviceTokenBroadcast shares the push device token with all the conversations.
func (svc *service) pushDeviceTokenBroadcast(ctx context.Context) error {
	conversations, err := svc.db.GetAllConversations()
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	svc.logger.Info("sharing push token", zap.Int("conversation-count", len(conversations)))

	deviceToken, err := svc.db.GetPushDeviceToken(messengerutil.B64EncodeBytes(svc.accountGroup))
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	if deviceToken.TokenType == pushtypes.PushServiceTokenType_PushTokenUndefined {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("wrong push token type"))
	}

	if len(deviceToken.Token) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("empty push token"))
	}

	if len(deviceToken.PublicKey) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("empty push token public key"))
	}

	if deviceToken.BundleID == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("empty push token bundle id"))
	}

	pushServerRecords, err := svc.db.GetPushServerRecords(messengerutil.B64EncodeBytes(svc.accountGroup))
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	for _, pushServerRecord := range pushServerRecords {
		if len(pushServerRecord.ServerKey) != cryptoutil.KeySize {
			return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid push server key"))
		}

		if pushServerRecord.ServerAddr == "" {
			return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid push server address"))
		}

		for _, conversation := range conversations {
			if err := svc.pushShareToken(ctx, conversation, deviceToken, pushServerRecord); err != nil {
				svc.logger.Error("unable to share push token on conversation", logutil.PrivateString("conversation-pk", conversation.PublicKey), zap.Error(err))
			}
		}
	}

	return nil
}

func (svc *service) pushShareToken(ctx context.Context, conversation *messengertypes.Conversation, deviceToken *messengertypes.PushDeviceToken, pushServerRecord *messengertypes.PushServerRecord) error {
	pushReceiver := &pushtypes.PushServiceReceiver{
		Token:              deviceToken.Token,
		TokenType:          deviceToken.TokenType,
		RecipientPublicKey: deviceToken.PublicKey,
		BundleID:           deviceToken.BundleID,
	}

	pushServer := &messengertypes.PushServer{
		Key:  pushServerRecord.ServerKey,
		Addr: pushServerRecord.ServerAddr,
	}

	memberToken, err := PushSealTokenForServer(pushReceiver, pushServer)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	memberToken.DevicePK = conversation.LocalDevicePublicKey

	// ignore if already shared
	tokenIdentifier := messengerutil.MakeSharedPushIdentifier(pushServerRecord.ServerKey, memberToken.Token)
	if _, err := svc.db.GetPushMemberToken(tokenIdentifier); err == nil {
		svc.logger.Info("push token already shared", zap.String("token-identifier", tokenIdentifier))
		return nil
	}

	conversationPKb, err := messengerutil.B64DecodeBytes(conversation.PublicKey)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	am, err := messengertypes.AppMessage_TypePushSetMemberToken.MarshalPayload(messengerutil.TimestampMs(time.Now()), "", &messengertypes.AppMessage_PushSetMemberToken{MemberToken: memberToken})
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	_, err = svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPK: conversationPKb, Payload: am})
	if err != nil {
		return errcode.ErrProtocolSend.Wrap(err)
	}

	return nil
}
