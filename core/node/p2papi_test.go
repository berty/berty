package node

import (
	"context"
	"fmt"
	"testing"

	"github.com/pkg/errors"

	"github.com/google/uuid"

	"berty.tech/core/push"

	"crypto/rand"
	"crypto/rsa"

	"crypto/x509"

	"bytes"

	"encoding/base64"

	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/test/mock"
	netmock "berty.tech/core/test/mock/network"
)

func b64(input []byte) string {
	return base64.StdEncoding.EncodeToString(input)
}

func generateDevice(contactID []byte) (keypair.Interface, *entity.Device) {
	device := &entity.Device{}

	privateKey, _ := rsa.GenerateKey(rand.Reader, 2048)
	privateKeyBytes, _ := x509.MarshalPKCS8PrivateKey(privateKey)
	publicKeyBytes, _ := x509.MarshalPKIXPublicKey(privateKey.Public())

	device.ID = b64(publicKeyBytes)
	device.Name = "Test device"
	device.ContactID = b64(contactID)

	cryptoImpl := &keypair.InsecureCrypto{}
	cryptoImpl.SetPrivateKeyData(privateKeyBytes)

	return cryptoImpl, device
}

func testNode(t *testing.T, opts ...NewNodeOption) (*Node, error) {
	_, device := generateDevice([]byte{})

	_, db, err := mock.GetMockedDb(entity.AllEntities()...)

	if err != nil {
		t.Fatalf("%s", err)
	}

	netDriver := &netmock.SimpleDriver{}
	opts = append(opts, WithSQL(db))
	opts = append(opts, WithDevice(device))
	opts = append(opts, WithNetworkDriver(netDriver))
	opts = append(opts, WithInitConfig())
	opts = append(opts, WithSoftwareCrypto())
	opts = append(opts, WithConfig())

	node, err := New(context.Background(), opts...)

	if err != nil {
		t.Fatalf("%s", err)
	}

	return node, nil
}

func TestOpenEnvelope(t *testing.T) {
	var (
		err          error
		decodedEvent *entity.Event
	)

	alice, _ := testNode(t)
	bob, _ := testNode(t)
	charlie, _ := testNode(t)

	_, aliceDevice2 := generateDevice(alice.pubkey)
	bobCrypto2, bobDevice2 := generateDevice(bob.pubkey)
	charlieCrypto2, charlieDevice2 := generateDevice(charlie.pubkey)

	charlieAlias := "ch4rli3_4l145"

	alice.RegisterDevice(context.Background(), aliceDevice2)
	bob.RegisterDevice(context.Background(), bobDevice2)
	charlie.RegisterDevice(context.Background(), charlieDevice2)

	aliceSigChainBytes, err := alice.sigchain.Marshal()
	bobSigChainBytes, err := bob.sigchain.Marshal()
	charlieSigChainBytes, err := charlie.sigchain.Marshal()

	alice.sql(nil).Save(&entity.Contact{ID: bob.b64pubkey, Sigchain: bobSigChainBytes, Status: entity.Contact_IsFriend})
	alice.sql(nil).Save(&entity.Device{ID: b64(bob.pubkey), ContactID: bob.b64pubkey})
	alice.sql(nil).Save(&entity.Device{ID: bobDevice2.ID, ContactID: bob.b64pubkey})

	alice.sql(nil).Save(&entity.Contact{ID: charlie.b64pubkey, Sigchain: charlieSigChainBytes, Status: entity.Contact_IsFriend})
	alice.sql(nil).Save(&entity.Device{ID: charlie.b64pubkey, ContactID: charlie.b64pubkey})
	alice.sql(nil).Save(&entity.Device{ID: charlieDevice2.ID, ContactID: charlie.b64pubkey})

	bob.sql(nil).Save(&entity.Contact{ID: alice.b64pubkey, Sigchain: aliceSigChainBytes, Status: entity.Contact_IsFriend})
	bob.sql(nil).Save(&entity.Device{ID: alice.b64pubkey, ContactID: alice.b64pubkey})
	bob.sql(nil).Save(&entity.Device{ID: aliceDevice2.ID, ContactID: alice.b64pubkey})

	bob.sql(nil).Save(&entity.Contact{ID: charlie.b64pubkey, Sigchain: charlieSigChainBytes, Status: entity.Contact_IsFriend})
	bob.sql(nil).Save(&entity.Device{ID: charlie.b64pubkey, ContactID: charlie.b64pubkey})
	bob.sql(nil).Save(&entity.Device{ID: charlieDevice2.ID, ContactID: charlie.b64pubkey})

	charlie.sql(nil).Save(&entity.Contact{ID: alice.b64pubkey, Sigchain: aliceSigChainBytes, Status: entity.Contact_IsFriend})
	charlie.sql(nil).Save(&entity.Device{ID: alice.b64pubkey, ContactID: alice.b64pubkey})
	charlie.sql(nil).Save(&entity.Device{ID: aliceDevice2.ID, ContactID: alice.b64pubkey})

	charlie.sql(nil).Save(&entity.Contact{ID: bob.b64pubkey, Sigchain: bobSigChainBytes, Status: entity.Contact_IsFriend})
	charlie.sql(nil).Save(&entity.Device{ID: bob.b64pubkey, ContactID: bob.b64pubkey})
	charlie.sql(nil).Save(&entity.Device{ID: bobDevice2.ID, ContactID: bob.b64pubkey})

	bob.sql(nil).Save(&entity.SenderAlias{Status: entity.SenderAlias_RECEIVED, OriginDeviceID: charlieDevice2.ID, AliasIdentifier: charlieAlias})

	//
	//
	// Primary Device
	//
	//

	event := &entity.Event{}
	event.Direction = entity.Event_Outgoing
	event.SourceDeviceID = alice.b64pubkey
	event.TargetAddr = bob.b64pubkey
	event.Attributes = []byte("First Device")
	eventBytes, _ := event.Marshal()

	// TODO: Encrypt event, tests will fail when OpenEnvelope will decrypt events

	envelope := &entity.Envelope{
		Source:         alice.DeviceID(),
		EncryptedEvent: eventBytes,
	}

	if envelope.Signature, err = keypair.Sign(alice.crypto, envelope); err != nil {
		t.Fatalf("failed to sign envelope")
	}

	if decodedEvent, err = bob.OpenEnvelope(context.Background(), envelope); err != nil {
		t.Error(err)
	}

	if decodedEvent.SourceDeviceID != alice.b64pubkey ||
		decodedEvent.TargetAddr != bob.b64pubkey ||
		bytes.Compare(decodedEvent.Attributes, []byte("First Device")) != 0 {
		t.Fatalf("wrong event data")
	}

	//
	//
	// Secondary Device
	//
	//

	event = &entity.Event{}
	event.Direction = entity.Event_Outgoing
	event.SourceDeviceID = bobDevice2.ID
	event.TargetAddr = alice.b64pubkey
	event.Attributes = []byte("Secondary Device")
	eventBytes, _ = event.Marshal()

	envelope = &entity.Envelope{
		Source:         bobDevice2.ID,
		EncryptedEvent: eventBytes,
	}

	if envelope.Signature, err = keypair.Sign(bobCrypto2, envelope); err != nil {
		t.Fatalf("failed to sign envelope")
	}

	if decodedEvent, err = alice.OpenEnvelope(context.Background(), envelope); err != nil {
		t.Fatal(err)
	}

	if decodedEvent.SourceDeviceID != bobDevice2.ID ||
		decodedEvent.TargetAddr != alice.b64pubkey ||
		bytes.Compare(decodedEvent.Attributes, []byte("Secondary Device")) != 0 {
		t.Fatalf("wrong event data")
	}

	//
	//
	// Aliased Device
	//
	//

	event = &entity.Event{}
	event.Direction = entity.Event_Outgoing
	event.SourceDeviceID = charlieDevice2.ID
	event.TargetAddr = bob.b64pubkey
	event.Attributes = []byte("Aliased Device")
	eventBytes, _ = event.Marshal()

	envelope = &entity.Envelope{
		Source:         charlieAlias,
		EncryptedEvent: eventBytes,
	}

	if envelope.Signature, err = keypair.Sign(charlieCrypto2, envelope); err != nil {
		t.Fatalf("failed to sign envelope")
	}

	if decodedEvent, err = bob.OpenEnvelope(context.Background(), envelope); err != nil {
		t.Fatal(err)
	}

	if decodedEvent.SourceDeviceID != charlieDevice2.ID ||
		decodedEvent.TargetAddr != bob.b64pubkey ||
		bytes.Compare(decodedEvent.Attributes, []byte("Aliased Device")) != 0 {
		t.Fatalf("wrong event data")
	}

	if decodedEvent, err = alice.OpenEnvelope(context.Background(), envelope); err == nil {
		t.Fatalf("alice should not be able to check this signature")
	}

}

func TestGetPushDestinationsForEvent(t *testing.T) {
	var err error
	identifiers := []*entity.DevicePushIdentifier{}

	pushRelayPrivateKey, _ := rsa.GenerateKey(rand.Reader, 2048)
	pushRelayPublicKeyBytes, _ := x509.MarshalPKIXPublicKey(pushRelayPrivateKey.Public())

	ctx := context.Background()
	alice, _ := testNode(t)

	alice.sql(ctx).Create(&entity.DevicePushConfig{
		ID:          "AlicePushConfig",
		DeviceID:    alice.config.CurrentDeviceID,
		PushType:    push.DevicePushType_APNS,
		PushID:      []byte("AlicePushToken"),
		RelayPubkey: b64(pushRelayPublicKeyBytes),
	})

	alice.sql(ctx).Create(&entity.Contact{ID: "Bob"})
	alice.sql(ctx).Create(&entity.Device{ID: "BobDevice", ContactID: "Bob"})
	pushIdBob := createPushId("BobDevice", push.DevicePushType_APNS, pushRelayPublicKeyBytes)
	alice.sql(ctx).Create(pushIdBob)

	alice.sql(ctx).Create(&entity.Contact{ID: "Charlie"})
	alice.sql(ctx).Create(&entity.Device{ID: "CharlieDevice", ContactID: "Charlie"})
	pushIdCharlie := createPushId("CharlieDevice", push.DevicePushType_FCM, pushRelayPublicKeyBytes)
	alice.sql(ctx).Create(pushIdCharlie)

	alice.sql(ctx).Create(&entity.Contact{ID: "Daryl"})
	alice.sql(ctx).Create(&entity.Device{ID: "DarylDevice", ContactID: "Daryl"})
	pushIdDaryl := createPushId("DarylDevice", push.DevicePushType_APNS, pushRelayPublicKeyBytes)
	alice.sql(ctx).Create(pushIdDaryl)

	alice.sql(ctx).Create(&entity.Conversation{ID: "ConversationBobCharlie"})

	alice.sql(ctx).Create(&entity.ConversationMember{
		ID:             "ConversationMemberBob",
		ConversationID: "ConversationBobCharlie",
		ContactID:      "Bob",
	})
	alice.sql(ctx).Create(&entity.ConversationMember{
		ID:             "ConversationMemberCharlie",
		ConversationID: "ConversationBobCharlie",
		ContactID:      "Charlie",
	})

	//
	// One to one checks
	//

	if identifiers, err = alice.getPushDestinationsForEvent(ctx, entity.NewEvent().SetToContactID("Bob")); err != nil {
		t.Error(err)
	}

	if len(identifiers) != 1 {
		t.Error(errors.New(fmt.Sprintf("expected 1 push identifier for one-to-one event, got %d", len(identifiers))))
	}

	if identifiers[0].ID != "BobDevicePushIdentifier" {
		t.Error(errors.New(fmt.Sprintf("invalid push identifier retrieved, expected BobDevicePushIdentifier, got %s", identifiers[0].ID)))
	}

	//
	// Conversation checks
	//

	expectedIdentifiers := map[string]bool{
		"BobDevicePushIdentifier":     false,
		"CharlieDevicePushIdentifier": false,
	}

	if identifiers, err = alice.getPushDestinationsForEvent(ctx, entity.NewEvent().SetToConversationID("ConversationBobCharlie")); err != nil {
		t.Error(err)
	}

	if len(identifiers) != 2 {
		t.Error(errors.New(fmt.Sprintf("expected 2 push identifiers for conversation event, got %d", len(identifiers))))
	}

	for _, identifier := range identifiers {
		_, ok := expectedIdentifiers[identifier.ID]
		if !ok {
			t.Error(errors.New(fmt.Sprintf("push identifier %s was not expected for conversation", identifier.ID)))
		}

		expectedIdentifiers[identifier.ID] = true
	}

	for identifier, found := range expectedIdentifiers {
		if !found {
			t.Error(errors.New(fmt.Sprintf("push identifier %s was expected for conversation", identifier)))
		}
	}
}

func createPushId(deviceId string, pushType push.DevicePushType, relayPubKeyBytes []byte) *entity.DevicePushIdentifier {
	pushId := fmt.Sprintf("%sPushIdentifier", deviceId)
	nonce, _ := uuid.New().MarshalBinary()

	plainPushStruct := &push.PushDestination{
		PushId:   []byte(pushId),
		Nonce:    nonce,
		PushType: pushType,
	}

	plainPushInfo, _ := plainPushStruct.Marshal()
	pushInfo, _ := keypair.Encrypt(plainPushInfo, relayPubKeyBytes)

	return &entity.DevicePushIdentifier{
		ID:          pushId,
		PushInfo:    pushInfo,
		RelayPubkey: b64(relayPubKeyBytes),
		DeviceID:    deviceId,
	}

}
