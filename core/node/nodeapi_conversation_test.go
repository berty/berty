package node

import (
	"context"
	"crypto/x509"
	"encoding/base64"
	"testing"

	crypto "github.com/libp2p/go-libp2p-crypto"

	"berty.tech/core/sql"
	"berty.tech/core/test/mock"

	"berty.tech/core/api/node"

	"berty.tech/core/entity"
	netMock "berty.tech/core/test/mock/network"
	"github.com/gofrs/uuid"
	. "github.com/smartystreets/goconvey/convey"
)

func mustUnmarshalRsaPrivateKey(key string) crypto.PrivKey {
	keyBytes, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		panic(err)
	}

	privKey, err := crypto.UnmarshalRsaPrivateKey(keyBytes)
	if err != nil {
		panic(err)
	}

	return privKey
}

func mustPubKeyString(key crypto.PrivKey) string {
	privBytes, err := key.Raw()
	if err != nil {
		panic(err)
	}

	rsaKey, err := x509.ParsePKCS1PrivateKey(privBytes)
	if err != nil {
		panic(err)
	}

	pubBytes, err := x509.MarshalPKIXPublicKey(rsaKey.Public())
	if err != nil {
		panic(err)
	}

	return base64.StdEncoding.EncodeToString(pubBytes)
}

var PrivKeyA = "MIICXAIBAAKBgQC9ehXHD7aW8YeWr1EGT6Aiz3fT72kKHALw85PjFv3SRlIcqQZxZ+7PQnQzyzwx3LIo/g13QBNzPUdsMYzS8Kk/jfYFKrcZ3SlpkHfDCr+Kc7FSURXrLG1cpvH8H3O1Ied6zbs1CrmvFlwfawymDHKdqdKGCjuAbXax4o0eOAl3bwIDAQABAoGAF+4UVAi7AcNNYY2QySBDVEIpmx2wgXNaN747nkGoGueAtVfvlWEP+yMkc+omFxINejnjz3zLOBG0NIjphTaZ2VJdK/0wWLvthV7BXBcTKD2NJeGKvRHg5xi/CNWDKMEXGj5CUrKVxzurEX7TjKlTq4sDXoN6LMBU8cyTa5xch/kCQQDedut6N1YW7M98iTnkVG4JEXQg9d4FUAKPcX8pqqo/KANxTl/xaJvXrx7X6tzCGEj1b5/sUsfhb4HKCEKEr2U9AkEA2golhi1+6vEQV5UANq3wYevg05jfU+abtAepQ7oQib0LIQYWXLJKeGk7SAjneyYQk+Hwc69fDbEzc3GVZ9GSGwJAO9Bzre+0+QMBIrXu1+KPl2aW98nDwV/q4FCe5UAa+FI04sE08L60sEBIpbtjUdifvUYfFLaJQabumbiw0eYq7QJAPf3Oh2SeBhw9wjjp06IGi0CuLlrze/4/3KKk/E2FcDPgWyZI61gBllSM90EY10mOQw1k+O8ufk0YTMVJbjgGawJBAMDNgkIs7IjDMNEVPxydgdhbnrNw8k+70ASVm7bVypXwLHIbpIcH4DMvrQLhAi6TV377rVtEEvny6asljA/MSL8="

var TestPrivateKeyA = mustUnmarshalRsaPrivateKey(PrivKeyA)
var TestPrivateKeyB = mustUnmarshalRsaPrivateKey("MIICXAIBAAKBgQCvgaZmRWdsLkWMLE51skZW3DqPosDPD+/fZziS7snVzxxcpehlHqDq/W/hqstN9d/eCE8c51mGaiOY6oqrgsMRwNAlzb8oaxr4c43w+FcolDybHvRrY4Ga8GzBl1rZGyWAzLtJ9QHNU2cqd0szf3bpydm10McyBTHXWO7kAZWmTQIDAQABAoGAe+271zmo5v3hhDKBEKDbBFisTWKqbUweoIzdqPtOsFh3+X/5kvXGwUhGaX5V4u38r2cEni9KyxxFmKP9WVCTdth8jEMs4nVy4NlW2Qu1/Cak7oqhtz3SPp/JfDo8sUi9V0xUMNRziaV5NoJdqAxvCQ3P9kjfAjPiCKfqxL12di0CQQDlWp2nare0Cwm2ojJAS8fT/DvEavUT2uyTYDby+bLCW/GN9Hc3sIDGo4LcrLvs+eNFdGj6lPVHJ+GNRXgl/EULAkEAw+WD/cN5I2nvXg5PzoD5185MSwppXQ7ImHjcmrc3w7AePFnZbI4k137dlMPtRioJ5HlH5ctqU2pn60Y4NIMpBwJAdxv3MgG/A3aUBc/4DuIMFfAxTdFKE5SnNeZKwyagCkXbjaA+5aH5Tq+N/3KJaglgWSqadkAznU992HMScY+wfwJACVNz5TDZI4Z3jtK/meUp/8widbAZNATwJ9IZLoRqczZ/OgBNCY360weHJP3u3dhCgE4FzjrQ5Qe7ysedBWL5IQJBALNlBuM2Eklhd5Iu5cyR/ysPrTvJGCf0kyP4X/fc6WbIkgNCoJihotng/7hyQLUmZvWlnxiigcDRfQk69dg5mV8=")
var TestPrivateKeyC = mustUnmarshalRsaPrivateKey("MIICXgIBAAKBgQCkQJCkZNVQn26HE0HPXFGsQMPUiO5Ivz0OivSSU6tr0iuJXzD/KDqfi6wlXZQnL7lpSfrBgCYXWLY/cEV4ZRgE9J90DbuRNQVpVrSqkxAVSLGSRjeseGzmow7rLC6nvLee0PIDj+dhxm8/oSIgmLgqm65vrCuuqQ8V8KdxmMd28QIDAQABAoGAZErsRwUu33DKW34dtBEp6aUOLmuCHDdxf7zHQ8YFKOwHG3VdhJ+61ArEDXjLavYQH8NFcvvdxmmrtqbGNJJ+DCXd1U7BGwMECw7wwZtt+s3azaR4JfYZhNvMRzoodGKqS6kP9vI/1WpuO4KsXOL+/qwSOQfVPXpO98D7Yr9qO+UCQQDXWYxPjSpm1E0P6u3P/D8dw2LDfO2baM6p7FUA2jOZIZ4n3c3+9WME3yz7gT3ugmjwwUqT+UsxFADhkGhZseo3AkEAw0HNsH0J2IRGToepqJbH8pXukfMvnse5B3OLRZsGZjc2RHO9YrAeOqIyW+GkOaGi0CwHjtOHFdFsOobRSmn0FwJBAK7OA7U3c6nQv1UicDQaH+m7BlqE+CLkqo0IR9/PP38X6NeXlnVVHzF/L3ZgbLNErIZxgGYpQD3wbN6sZ+gXIXUCQQCT43VNZYddjOJLfIlN/dY3sMPfm5fH5XIJaMRl1gNEzDC4LAmXg9mBg3QtD3x5gil1DsQys5gvOE2HDrHacOHFAkEA0xGMEwQE+02yT8SPEwIVWVXenYinWhhUt6waXVgCJ0D27mEyffGuoiODpLBJLkLZI6Re1rBGoOiZH6c5x6FClA==")
var TestPrivateKeyD = mustUnmarshalRsaPrivateKey("MIICXQIBAAKBgQDrvNuWePJ3sRPVLG22U38bspcDVnl+Srnqdm+Bq4TeBznm+Gm0yY+fqgV2jzf+Uh3wS4JZEJeDBMW/SXz+mWgTe3IeYMxyozeWApKw+kks4nfqalRYkA2v5xsR9Ao/CsnsmJ84FW4u8IzK9Y7TwudXczEzPiOULxyxJLtFPOtABwIDAQABAoGBAJ/jLgR27+1iexMg2SDKrPF6RZaL9kdEI6j0v1hxnuKAgDM51Wg7NWCTjrUFGnMx+wBaFoSWDk1c1UqSa2a7YaxXoXhJf60lQ9FBekUoo2OioV+S0KsnLTdgmz6bK95T+r399u0uDWcJAUtkyHJg3BlfrjfEQujpCHF8SRPrFnuBAkEA/nwlE7GnvAIWoVX3UZU9I307Zowg8psMnAHVn2nAVLruDcAqzzBU4sCKVlQwr+Jw2wfq8QGjXyrVhFWVgsO2pwJBAO0kJASYdNTALZQ+ftQXEz8AkYazXmwFAEK7hnM6oLEZdAz9vgJwpHG1PG3E7wUo2U2gg6Rkrxlm/6n3RLIct6ECQBT0+kSt66dC8MQmhTB1vswuYvbl8UypUheC2ym+lrUjk7kUKzJWw5bMzlefpUbGug5/j2x7ew26RE0aky5qmZ8CQBv1qeV80DGRYw5ae/unqNZBy+a02UolIM29bHHDlNSsqpkphbCl9U2Oz8wlbwUNtulHJp5IXLjDAxvYEpppdmECQQCts8VPiDoOz5amUXRgwv2bCX2Rfz+cMg9T/pUQid1ZH1Cop6zNAauLc/mP1/IgwKvjUlOZaawBL8JVFbEAUQDu")

var PubKeyA = mustPubKeyString(TestPrivateKeyA)
var PubKeyB = mustPubKeyString(TestPrivateKeyB)
var PubKeyC = mustPubKeyString(TestPrivateKeyC)
var PubKeyD = mustPubKeyString(TestPrivateKeyD)

func TestConversationCreate(t *testing.T) {
	ctx := context.Background()

	Convey("Test conversation create", t, func() {
		path, n, err := testConversationInitDB(ctx)
		So(err, ShouldBeNil)

		defer mock.RemoveDb(path, n.sqlDriver)

		So(getConversationsCount(n), ShouldEqual, 0)

		conv, err := testConversationCreate(ctx, n, []string{PubKeyA}, entity.Conversation_Group)
		So(err, ShouldBeNil)
		So(conv, ShouldNotBeNil)

		So(getConversationsCount(n), ShouldEqual, 1)

		conv, err = testConversationCreate(ctx, n, []string{PubKeyB}, entity.Conversation_OneToOne)
		So(err, ShouldBeNil)
		So(conv, ShouldNotBeNil)

		So(getConversationsCount(n), ShouldEqual, 2)

		conv, err = testConversationCreate(ctx, n, []string{PubKeyA, PubKeyB}, entity.Conversation_Group)
		So(err, ShouldBeNil)
		So(conv, ShouldNotBeNil)

		So(getConversationsCount(n), ShouldEqual, 3)

		conv, err = testConversationCreate(ctx, n, []string{PubKeyA, PubKeyB, PubKeyC}, entity.Conversation_Group)
		So(err, ShouldBeNil)
		So(conv, ShouldNotBeNil)

		So(getConversationsCount(n), ShouldEqual, 4)

		conv, err = testConversationCreate(ctx, n, []string{PubKeyA, PubKeyB, PubKeyC}, entity.Conversation_Group)
		So(err, ShouldBeNil)
		So(conv, ShouldNotBeNil)

		So(getConversationsCount(n), ShouldEqual, 5)
	})
}

func TestConversationInvite(t *testing.T) {
	ctx := context.Background()

	Convey("Test conversation invite, add with all contacts", t, func() {
		path, n, err := testConversationInitDB(ctx)
		So(err, ShouldBeNil)

		defer mock.RemoveDb(path, n.sqlDriver)

		mucConversation, err := testConversationCreate(ctx, n, []string{PubKeyA, PubKeyB, PubKeyC}, entity.Conversation_Group)
		So(mucConversation, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(getConversationsCount(n), ShouldEqual, 1)

		updatedConversation, err := testConversationInvite(ctx, n, mucConversation, []string{PubKeyA, PubKeyB, PubKeyC, PubKeyD})
		So(updatedConversation, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(getConversationsCount(n), ShouldEqual, 1)
	})

	Convey("Test conversation invite, add with single contact", t, func() {
		path, n, err := testConversationInitDB(ctx)
		So(err, ShouldBeNil)

		defer mock.RemoveDb(path, n.sqlDriver)

		mucConversation, err := testConversationCreate(ctx, n, []string{PubKeyA, PubKeyB, PubKeyC}, entity.Conversation_Group)
		So(mucConversation, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(getConversationsCount(n), ShouldEqual, 1)

		updatedConversation, err := testConversationInvite(ctx, n, mucConversation, []string{PubKeyD})
		So(updatedConversation, ShouldNotBeNil)
		So(err, ShouldBeNil)

		So(getConversationsCount(n), ShouldEqual, 1)
	})
}

func testConversationInvite(
	ctx context.Context,
	n *Node,
	conversation *entity.Conversation,
	ids []string,
) (*entity.Conversation, error) {
	contacts := []*entity.Contact{}
	for _, id := range ids {
		contacts = append(contacts, &entity.Contact{ID: id, Status: entity.Contact_IsFriend})
	}
	return n.ConversationInvite(ctx, &node.ConversationManageMembersInput{
		Conversation: conversation,
		Contacts:     contacts,
	})
}

func testConversationCreate(ctx context.Context, n *Node, contactIDs []string, kind entity.Conversation_Kind) (*entity.Conversation, error) {
	contacts := []*entity.Contact{}

	for _, contactID := range contactIDs {
		contacts = append(contacts, &entity.Contact{ID: contactID})
	}

	return n.ConversationCreate(ctx, &node.ConversationCreateInput{
		Contacts: contacts,
		Kind:     kind,
	})
}

func getConversationsCount(n *Node) int {
	count := 0
	So(n.sqlDriver.Model(&entity.Conversation{}).Count(&count).Error, ShouldBeNil)

	return count
}

func testConversationInitDB(ctx context.Context) (string, *Node, error) {
	path, n, err := NodeMock(ctx, &entity.Device{Name: PubKeyA, ContactID: PubKeyA, Status: entity.Device_Myself})
	So(path, ShouldNotEqual, "")
	So(err, ShouldBeNil)
	So(n, ShouldNotBeNil)

	for i, letter := range []string{PubKeyA, PubKeyB, PubKeyC, PubKeyD} {
		contact := &entity.Contact{ID: letter}
		if i == 0 {
			contact.Status = entity.Contact_Myself
		}
		err := n.sqlDriver.Save(contact).Error
		So(err, ShouldBeNil)

		err = n.sqlDriver.Save(&entity.Device{ID: letter, ContactID: letter}).Error
		So(err, ShouldBeNil)
	}

	return path, n, nil
}

func NodeMock(ctx context.Context, device *entity.Device) (string, *Node, error) {
	path, db, err := mock.GetMockedDb(sql.AllModels()...)
	So(err, ShouldBeNil)

	myself := &entity.Contact{ID: device.ID, Status: entity.Contact_Myself, DisplayName: device.ID}
	err = db.Save(&myself).Error
	So(err, ShouldBeNil)

	err = db.Save(device).Error
	So(err, ShouldBeNil)

	privBytesPCKS1, _ := TestPrivateKeyA.Raw()
	rsaKey, err := x509.ParsePKCS1PrivateKey(privBytesPCKS1)
	So(err, ShouldBeNil)

	privBytes, err := x509.MarshalPKCS8PrivateKey(rsaKey)
	So(err, ShouldBeNil)

	err = db.Save(&entity.Config{
		ID:                         uuid.Must(uuid.NewV4()).String(),
		NotificationsEnabled:       false,
		NotificationsPreviews:      false,
		DebugNotificationVerbosity: entity.DebugVerbosity_VERBOSITY_LEVEL_ERROR,
		CurrentDevice:              device,
		CurrentDeviceID:            device.ID,
		Myself:                     myself,
		MyselfID:                   myself.ID,
		CryptoParams:               privBytes,
	}).Error
	So(err, ShouldBeNil)

	n, err := New(ctx,
		WithSQL(db),
		WithDevice(device),
		WithNetworkDriver(netMock.NewEnqueuer(context.Background())),
		WithInitConfig(),
		WithSoftwareCrypto(),
		WithConfig(),
	)

	So(err, ShouldBeNil)

	return path, n, nil
}
