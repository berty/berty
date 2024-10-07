package bertymessenger

import (
	"context"
	crand "crypto/rand"
	"fmt"
	"sync"
	"time"

	"github.com/ipfs/go-cid"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/v2/pkg/cryptoutil"
	"berty.tech/weshnet/v2/pkg/logutil"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

func (svc *service) PushSetDeviceToken(ctx context.Context, request *messengertypes.PushSetDeviceToken_Request) (*messengertypes.PushSetDeviceToken_Reply, error) {
	if _, err := svc.db.GetPushDeviceToken(messengerutil.B64EncodeBytes(svc.accountGroup)); err == nil {
		svc.logger.Info("PushSetDeviceToken: push token already set")
		return &messengertypes.PushSetDeviceToken_Reply{}, nil
	}

	if request.Receiver == nil || request.Receiver.TokenType == pushtypes.PushServiceTokenType_PushTokenUndefined {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("invalid push token provided"))
	}

	request.Receiver.RecipientPublicKey = svc.pushHandler.PushPK()[:]

	am, err := messengertypes.AppMessage_TypePushSetDeviceToken.MarshalPayload(messengerutil.TimestampMs(time.Now()), "", &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: request.Receiver,
	})
	if err != nil {
		return nil, errcode.ErrCode_ErrSerialization.Wrap(err)
	}

	_, err = svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPk: svc.accountGroup, Payload: am})
	if err != nil {
		return nil, errcode.ErrCode_ErrProtocolSend.Wrap(err)
	}

	return &messengertypes.PushSetDeviceToken_Reply{}, nil
}

func (svc *service) PushSetServer(ctx context.Context, request *messengertypes.PushSetServer_Request) (*messengertypes.PushSetServer_Reply, error) {
	if request.Server == nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("invalid push server provided"))
	}

	// check if the server entry already exists
	if _, err := svc.db.GetPushServerRecord(messengerutil.B64EncodeBytes(svc.accountGroup), request.Server.Addr); err == nil {
		return &messengertypes.PushSetServer_Reply{}, nil
	} else if !errcode.Is(err, errcode.ErrCode_ErrNotFound) {
		return nil, err
	}

	am, err := messengertypes.AppMessage_TypePushSetServer.MarshalPayload(messengerutil.TimestampMs(time.Now()), "", &messengertypes.AppMessage_PushSetServer{
		Server: request.Server,
	})
	if err != nil {
		return nil, errcode.ErrCode_ErrSerialization.Wrap(err)
	}

	_, err = svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPk: svc.accountGroup, Payload: am})
	if err != nil {
		return nil, errcode.ErrCode_ErrProtocolSend.Wrap(err)
	}

	return &messengertypes.PushSetServer_Reply{}, nil
}

// PushSealTokenForServer seals a device push token with the push server public key
func PushSealTokenForServer(receiver *pushtypes.PushServiceReceiver, server *messengertypes.PushServer) (*messengertypes.PushMemberTokenUpdate, error) {
	if server == nil || len(server.Key) != cryptoutil.KeySize {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("expected a server key of %d bytes", cryptoutil.KeySize))
	}

	if receiver == nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("expected the receiver value to be defined"))
	}

	serverKey := [cryptoutil.KeySize]byte{}
	copy(serverKey[:], server.Key)

	opaqueToken, err := proto.Marshal(receiver)
	if err != nil {
		return nil, errcode.ErrCode_ErrSerialization.Wrap(err)
	}

	opaqueToken, err = box.SealAnonymous(nil, opaqueToken, &serverKey, crand.Reader)
	if err != nil {
		return nil, err
	}

	return &messengertypes.PushMemberTokenUpdate{
		Token:  opaqueToken,
		Server: server,
	}, nil
}

// PushShareTokenForConversation shares a device push token to all other members of the given conversationPK
func (svc *service) PushShareTokenForConversation(ctx context.Context, request *messengertypes.PushShareTokenForConversation_Request) (*messengertypes.PushShareTokenForConversation_Reply, error) {
	if request.ConversationPk == "" {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("invalid conversation public key provided"))
	}

	svc.logger.Info("PushShareTokenForConversation", logutil.PrivateString("conversationPK", request.ConversationPk))

	conversation, err := svc.db.GetConversationByPK(request.ConversationPk)
	if err != nil {
		return nil, errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	deviceToken, err := svc.db.GetPushDeviceToken(messengerutil.B64EncodeBytes(svc.accountGroup))
	if err != nil {
		return nil, errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	if deviceToken.TokenType == pushtypes.PushServiceTokenType_PushTokenUndefined {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("wrong push token type"))
	}

	if len(deviceToken.Token) == 0 {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("empty push token"))
	}

	if len(deviceToken.PublicKey) == 0 {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("empty push token public key"))
	}

	if deviceToken.BundleId == "" {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("empty push token bundle id"))
	}

	pushServerRecords, err := svc.db.GetPushServerRecords(messengerutil.B64EncodeBytes(svc.accountGroup))
	if err != nil {
		return nil, errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	// Currently, we only support one push server
	pushServerRecord := pushServerRecords[0]
	if len(pushServerRecord.ServerKey) != cryptoutil.KeySize {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("invalid push server key"))
	}

	if pushServerRecord.ServerAddr == "" {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("invalid push server address"))
	}

	if err := svc.pushShareToken(ctx, conversation, deviceToken, pushServerRecord); err != nil {
		return nil, err
	}

	return &messengertypes.PushShareTokenForConversation_Reply{}, nil
}

func (svc *service) PushTokenSharedForConversation(request *messengertypes.PushTokenSharedForConversation_Request, server messengertypes.MessengerService_PushTokenSharedForConversationServer) error {
	tokens, err := svc.db.GetPushMemberTokensForConversation(request.ConversationPk)
	if err != nil {
		return errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	for _, token := range tokens {
		if err := server.Send(&messengertypes.PushTokenSharedForConversation_Reply{Token: token}); err != nil {
			return errcode.ErrCode_ErrStreamWrite.Wrap(err)
		}
	}

	return nil
}

func (svc *service) PushSend(ctx context.Context, request *messengertypes.PushSend_Request) (*messengertypes.PushSend_Reply, error) {
	groupPKb, err := messengerutil.B64DecodeBytes(request.GroupPk)
	if err != nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(err)
	}

	sealedMessageEnvelope, err := svc.protocolClient.OutOfStoreSeal(ctx, &protocoltypes.OutOfStoreSeal_Request{
		Cid:            request.Cid,
		GroupPublicKey: groupPKb,
	})
	if err != nil {
		return nil, errcode.ErrCode_ErrInternal.Wrap(err)
	}

	pushTargets, memberDevices, err := svc.getPushTargetsByServer(request.GroupPk, request.GroupMembers)
	if err != nil {
		return nil, errcode.ErrCode_ErrInternal.Wrap(err)
	}

	_, cid, err := cid.CidFromBytes(request.Cid)
	if err != nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(err)
	}

	if len(pushTargets) == 0 {
		svc.logger.Info("PushSend - pushing - no targets", logutil.PrivateString("cid", cid.String()))
		return &messengertypes.PushSend_Reply{}, nil
	}

	wg := sync.WaitGroup{}
	wg.Add(len(pushTargets))

	for serverAddr, pushTokens := range pushTargets {
		// @FIXME(gfanton): find a better way to get service token
		go func(serverAddr string, pushTokens []*pushtypes.PushServiceOpaqueReceiver) {
			svc.logger.Info("PushSend - pushing", logutil.PrivateString("cid", cid.String()), logutil.PrivateString("server", serverAddr))
			defer wg.Done()

			if len(pushTokens) == 0 {
				svc.logger.Info("no push receivers", logutil.PrivateString("push-server", serverAddr))
				return
			}

			client, err := svc.getPushClient(serverAddr)
			if err != nil {
				svc.logger.Error("error while dialing push server", logutil.PrivateString("push-server", serverAddr), zap.Error(err))
				return
			}

			_, err = client.Send(ctx, &pushtypes.PushServiceSend_Request{
				Envelope:  sealedMessageEnvelope.Encrypted,
				Priority:  pushtypes.PushServicePriority_PushPriorityNormal,
				Receivers: pushTokens,
			}, grpc.WaitForReady(true))
			if err != nil {
				svc.logger.Error("error while dialing push server", logutil.PrivateString("push-server", serverAddr), zap.Error(err))
				return
			}

			svc.logger.Debug("send push notification successfully", logutil.PrivateString("cid", cid.String()), logutil.PrivateString("endpoint", serverAddr))
		}(serverAddr, pushTokens)
	}

	wg.Wait()

	return &messengertypes.PushSend_Reply{GroupMembers: memberDevices}, nil
}

func (svc *service) PushSetAutoShare(ctx context.Context, request *messengertypes.PushSetAutoShare_Request) (*messengertypes.PushSetAutoShare_Reply, error) {
	if err := svc.db.PushSetReplicationAutoShare(messengerutil.B64EncodeBytes(svc.accountGroup), request.Enabled); err != nil {
		return nil, err
	}

	if request.Enabled {
		if err := svc.pushDeviceTokenBroadcast(ctx); err != nil {
			return nil, errcode.ErrCode_ErrInternal.Wrap(err)
		}
	}

	acc, err := svc.db.GetAccount()
	if err != nil {
		return nil, err
	}

	// dispatch event
	if err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeAccountUpdated, &messengertypes.StreamEvent_AccountUpdated{Account: acc}, false); err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(err)
	}

	return &messengertypes.PushSetAutoShare_Reply{}, nil
}

func (svc *service) PushReceive(ctx context.Context, request *messengertypes.PushReceive_Request) (*messengertypes.PushReceive_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	return svc.pushReceiver.PushReceive(ctx, request.Payload)
}
