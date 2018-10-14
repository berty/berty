package node

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/core/crypto/keypair"
)

// WithCrypto set the underlying crypto (keypair.Interface) object inside Node
func WithCrypto(cryptoImpl keypair.Interface) NewNodeOption {
	return func(n *Node) {
		n.crypto = cryptoImpl
	}
}

func WithSoftwareCrypto() NewNodeOption {
	return func(n *Node) {
		var privBytes []byte

		if bytes.Compare(n.config.CryptoParams, []byte{}) == 0 {
			// FIXME: setting default keysize to 1024 to speedup development (tests), we need to increase the security before the release
			priv, err := rsa.GenerateKey(rand.Reader, 1024)
			if err != nil {
				zap.Error(errors.Wrap(err, "failed to generate RSA key"))
				return
			}
			privBytes, err = x509.MarshalPKCS8PrivateKey(priv)

			if err != nil {
				zap.Error(errors.Wrap(err, "failed to marshal private key"))
				return
			}

			n.config.CryptoParams = privBytes
			if err = n.sql.Save(n.config).Error; err != nil {
				err := errors.Wrap(err, "failed to save RSA key")
				logger().Error("node.WithSoftwareCrypto", zap.Error(err))
				return

			}
		}

		cryptoImpl := &keypair.InsecureCrypto{}
		if err := cryptoImpl.SetPrivateKeyData(n.config.CryptoParams); err != nil {
			zap.Error(errors.Wrap(err, "failed to set private key in keypair"))
			return
		}

		n.crypto = cryptoImpl
	}
}
