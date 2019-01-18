package node

import (
	"context"
	"testing"

	"crypto/rand"
	"crypto/rsa"

	"crypto/x509"

	"bytes"

	"encoding/base64"

	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	netmock "berty.tech/core/network/mock"
	"berty.tech/core/test/mock"
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
		decodedEvent *p2p.Event
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

	event := &p2p.Event{}
	event.Direction = p2p.Event_Outgoing
	event.SenderID = alice.b64pubkey
	event.ReceiverID = bob.b64pubkey
	event.Attributes = []byte("First Device")
	eventBytes, _ := event.Marshal()

	// TODO: Encrypt event, tests will fail when OpenEnvelope will decrypt events

	envelope := &p2p.Envelope{
		Source:         alice.DeviceID(),
		EncryptedEvent: eventBytes,
	}

	if envelope.Signature, err = keypair.Sign(alice.crypto, envelope); err != nil {
		t.Fatalf("failed to sign envelope")
	}

	if decodedEvent, err = bob.OpenEnvelope(context.Background(), envelope); err != nil {
		t.Error(err)
	}

	if decodedEvent.SenderID != alice.b64pubkey ||
		decodedEvent.ReceiverID != bob.b64pubkey ||
		bytes.Compare(decodedEvent.Attributes, []byte("First Device")) != 0 {
		t.Fatalf("wrong event data")
	}

	//
	//
	// Secondary Device
	//
	//

	event = &p2p.Event{}
	event.Direction = p2p.Event_Outgoing
	event.SenderID = bobDevice2.ID
	event.ReceiverID = alice.b64pubkey
	event.Attributes = []byte("Secondary Device")
	eventBytes, _ = event.Marshal()

	envelope = &p2p.Envelope{
		Source:         bobDevice2.ID,
		EncryptedEvent: eventBytes,
	}

	if envelope.Signature, err = keypair.Sign(bobCrypto2, envelope); err != nil {
		t.Fatalf("failed to sign envelope")
	}

	if decodedEvent, err = alice.OpenEnvelope(context.Background(), envelope); err != nil {
		t.Fatal(err)
	}

	if decodedEvent.SenderID != bobDevice2.ID ||
		decodedEvent.ReceiverID != alice.b64pubkey ||
		bytes.Compare(decodedEvent.Attributes, []byte("Secondary Device")) != 0 {
		t.Fatalf("wrong event data")
	}

	//
	//
	// Aliased Device
	//
	//

	event = &p2p.Event{}
	event.Direction = p2p.Event_Outgoing
	event.SenderID = charlieDevice2.ID
	event.ReceiverID = bob.b64pubkey
	event.Attributes = []byte("Aliased Device")
	eventBytes, _ = event.Marshal()

	envelope = &p2p.Envelope{
		Source:         charlieAlias,
		EncryptedEvent: eventBytes,
	}

	if envelope.Signature, err = keypair.Sign(charlieCrypto2, envelope); err != nil {
		t.Fatalf("failed to sign envelope")
	}

	if decodedEvent, err = bob.OpenEnvelope(context.Background(), envelope); err != nil {
		t.Fatal(err)
	}

	if decodedEvent.SenderID != charlieDevice2.ID ||
		decodedEvent.ReceiverID != bob.b64pubkey ||
		bytes.Compare(decodedEvent.Attributes, []byte("Aliased Device")) != 0 {
		t.Fatalf("wrong event data")
	}

	if decodedEvent, err = alice.OpenEnvelope(context.Background(), envelope); err == nil {
		t.Fatalf("alice should not be able to check this signature")
	}

}
