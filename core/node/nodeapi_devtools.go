package node

import (
	"context"
	crand "crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"math/rand"
	"strings"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/crypto/sigchain"
	"berty.tech/core/entity"
	"github.com/brianvoe/gofakeit"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
)

func (n *Node) GenerateFakeData(_ context.Context, input *node.Void) (*node.Void, error) {
	// FIXME: enable mutext, but allow calling submethod, i.e., node.CreateConversation
	//n.handleMutex.Lock()
	//defer n.handleMutex.Unlock()

	contacts := []*entity.Contact{}
	for i := 0; i < 10; i++ {
		var (
			username   = gofakeit.Username()
			devicename = fmt.Sprintf("%s's phone", username)
		)
		if rand.Intn(3) > 0 {
			username = fmt.Sprintf("%s %s", gofakeit.FirstName(), gofakeit.LastName())
		}

		priv, err := rsa.GenerateKey(crand.Reader, 512)
		if err != nil {
			return nil, errors.Wrap(err, "failed to generate rsa key")
		}
		privBytes, err := x509.MarshalPKCS8PrivateKey(priv)
		if err != nil {
			return nil, errors.Wrap(err, "failed to marshal private key")
		}
		pubBytes, err := x509.MarshalPKIXPublicKey(priv.Public())
		if err != nil {
			return nil, errors.Wrap(err, "failed to marshal public key")
		}
		kp := keypair.InsecureCrypto{}
		if err := kp.SetPrivateKeyData(privBytes); err != nil {
			return nil, errors.Wrap(err, "failed to set private key in kp")
		}
		sc := sigchain.SigChain{}
		if err := sc.Init(&kp, string(pubBytes)); err != nil {
			return nil, errors.Wrap(err, "failed to init sigchain")
		}
		scBytes, err := proto.Marshal(&sc)
		if err != nil {
			return nil, errors.Wrap(err, "failed to marshal sigchain")
		}
		contact := &entity.Contact{
			ID:          base64.StdEncoding.EncodeToString(pubBytes),
			DisplayName: username,
			Status:      entity.Contact_Status(rand.Intn(5) + 1),
			Sigchain:    scBytes,
			Devices: []*entity.Device{
				{
					ID:         base64.StdEncoding.EncodeToString(pubBytes),
					Name:       devicename,
					Status:     entity.Device_Status(rand.Intn(3) + 1),
					ApiVersion: p2p.Version,
				},
			},
		}
		if err := n.sql.Set("gorm:association_autoupdate", true).Save(&contact).Error; err != nil {
			return nil, errors.Wrap(err, "failed to save contacts")
		}
		contacts = append(contacts, contact)
	}

	for i := 0; i < 10; i++ {
		members := []*entity.ConversationMember{}
		for j := 0; j < rand.Intn(2)+1; j++ {
			members = append(members, &entity.ConversationMember{
				ContactID: contacts[rand.Intn(len(contacts))].ID,
			})
		}
		if _, err := n.ConversationCreate(context.Background(), &entity.Conversation{
			Members: members,
			Title:   strings.Title(fmt.Sprintf("%s %s", gofakeit.HipsterWord(), gofakeit.HackerNoun())),
			Topic:   gofakeit.HackerPhrase(),
		}); err != nil {
			return nil, errors.Wrap(err, "failed to create conversation")
		}
	}

	return &node.Void{}, nil
}
