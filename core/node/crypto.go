package node

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"io/ioutil"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/core/crypto/keypair"
	"berty.tech/core/pkg/tracing"
)

// WithCrypto set the underlying crypto (keypair.Interface) object inside Node
func WithCrypto(cryptoImpl keypair.Interface) NewNodeOption {
	return func(n *Node) {
		n.crypto = cryptoImpl
	}
}

func WithFixedSoftwareCrypto(path string) NewNodeOption {
	return func(n *Node) {
		tracer := tracing.EnterFunc(n.rootContext)
		defer tracer.Finish()

		privPem, err := ioutil.ReadFile(path)

		if err != nil {
			zap.Error(errors.Wrap(err, "invalid private key"))
			return
		}

		block, _ := pem.Decode(privPem)

		rsaKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			zap.Error(errors.Wrap(err, "invalid private key"))
			return
		}

		privBytes, err := x509.MarshalPKCS8PrivateKey(rsaKey)
		if err != nil {
			zap.Error(errors.Wrap(err, "invalid private key"))
			return
		}
		cryptoImpl := &keypair.InsecureCrypto{}
		if err := cryptoImpl.SetPrivateKeyData(privBytes); err != nil {
			zap.Error(errors.Wrap(err, "failed to set private key in keypair"))
			return
		}

		n.crypto = cryptoImpl
	}
}

func WithSoftwareCrypto() NewNodeOption {
	return func(n *Node) {
		tracer := tracing.EnterFunc(n.rootContext)
		defer tracer.Finish()
		ctx := tracer.Context()

		var privBytes []byte

		if bytes.Compare(n.config.CryptoParams, []byte{}) == 0 {
			// FIXME: setting default keysize to 2048 to speedup development (tests), we need to increase the security before the release
			priv, err := rsa.GenerateKey(rand.Reader, 2048)
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
			if err = n.sql(ctx).Save(n.config).Error; err != nil {
				err := errors.Wrap(err, "failed to save RSA key")
				n.LogBackgroundError(ctx, errors.Wrap(err, "node.WithSoftwareCrypto"))
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
