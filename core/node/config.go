package node

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/crypto/keypair"
	"github.com/berty/berty/core/crypto/sigchain"
	"github.com/berty/berty/core/entity"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
)

func (n *Node) initConfig() (*entity.Config, error) {
	// keypair
	priv, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate RSA key")
	}
	privBytes, _ := x509.MarshalPKCS8PrivateKey(priv)
	pubBytes, err := x509.MarshalPKIXPublicKey(priv.Public())
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal priv key")
	}

	// sigchain
	cryptoImpl := keypair.InsecureCrypto{} // FIXME: use enclave
	if err := cryptoImpl.SetPrivateKeyData(privBytes); err != nil {
		return nil, errors.Wrap(err, "failed to set private key in keypair")
	}
	sc := sigchain.SigChain{}

	if err := sc.Init(&cryptoImpl, string(pubBytes)); err != nil {
		return nil, errors.Wrap(err, "failed to initialize sigchain")
	}

	// db object
	currentDevice := &entity.Device{
		Status:     entity.Device_Myself,
		ID:         base64.RawStdEncoding.EncodeToString(pubBytes),
		Name:       n.initDevice.Name,
		ApiVersion: p2p.Version,
	}

	scBytes, err := proto.Marshal(&sc)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal sigchain")
	}

	config := entity.Config{
		Myself: &entity.Contact{
			ID:          base64.RawStdEncoding.EncodeToString(pubBytes),
			Devices:     []*entity.Device{currentDevice},
			DisplayName: n.initDevice.Username(),
			Status:      entity.Contact_Myself,
			Sigchain:    scBytes,
		},
		CurrentDevice: currentDevice,
	}

	if err := n.sql.Set("gorm:association_autoupdate", true).Save(&config).Error; err != nil {
		return nil, errors.Wrap(err, "failed to save config")
	}
	return n.Config()
}

// Config gets config from database
func (n *Node) Config() (*entity.Config, error) {
	var config entity.Config
	return &config, n.sql.First(&config).Error
}
