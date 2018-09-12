package sigchain

import (
	"bytes"
	"errors"
	"time"

	"crypto"

	"berty.tech/core/crypto/keypair"
	"github.com/gogo/protobuf/proto"
)

var theFuture = time.Date(2099, time.December, 31, 0, 0, 0, 0, time.UTC)

func MakeCertificate(cryptoImpl keypair.Interface, publicKey []byte, identityID string, parentCertificate *keypair.Certificate, parentEventHash []byte) (*keypair.Certificate, error) {
	extension := EventExtension{}
	extension.Version = EventExtensionVersions_VERSION_1
	extension.ParentEventHash = parentEventHash

	extensionBytes, err := extension.Marshal()

	if err != nil {
		return nil, err
	}

	certificate := &keypair.CertificateContent{}

	certificate.Version = keypair.CertRevocationVersions_VERSION_1
	certificate.NotBefore = time.Now() // TODO: we might face devices with an invalid date
	certificate.NotAfter = theFuture   // TODO: we might want to have expiring devices (short lived internet café sessions, bots etc.)
	certificate.Subject = identityID
	certificate.PublicKey = publicKey
	certificate.Extension = extensionBytes

	if parentCertificate != nil {
		certificate.Issuer = parentCertificate.Content.Subject
	} else {
		// If self signed use self identityID
		certificate.Issuer = identityID
	}

	raw, err := certificate.GetDataToSign()

	if err != nil {
		return nil, err
	}

	signature, err := cryptoImpl.Sign(raw)
	sigAlgorithm := cryptoImpl.SignatureAlgorithm()

	if err != nil {
		return nil, err
	}

	return &keypair.Certificate{
		Content: certificate,
		Signature: &keypair.Signature{
			Signature:          signature,
			SignatureAlgorithm: sigAlgorithm,
		},
	}, nil
}

func (m *SigChain) Init(cryptoImpl keypair.Interface, identityID string) error {
	publicKey, err := cryptoImpl.GetPubKey()

	if err != nil {
		return err
	}

	signedCertificate, err := MakeCertificate(cryptoImpl, publicKey, identityID, nil, []byte{})

	if err != nil {
		return err
	}

	payload, err := proto.Marshal(signedCertificate)

	if err != nil {
		return err
	}

	event := SigEvent{
		EventType: SigEvent_INIT_CHAIN,
		Payload:   payload,
		PublicKey: signedCertificate.Content.PublicKey,
		CreatedAt: time.Now(),
		Issuer:    identityID,
		Subject:   identityID,
	}

	event.Hash, err = event.ComputeHashForEvent()

	if err != nil {
		return err
	}

	m.UserId = identityID
	m.Events = []*SigEvent{&event}

	return nil
}

func (m *SigChain) GetCertificateForIdentity(identityID string) (*keypair.Certificate, error) {
	for i := range m.Events {
		event := m.Events[i]
		if (event.EventType == SigEvent_ADD_DEVICE || event.EventType == SigEvent_INIT_CHAIN) && event.Subject == identityID {
			certificate := &keypair.Certificate{}
			err := certificate.Unmarshal(event.Payload)

			if err != nil {
				return nil, err
			}

			return certificate, nil
		}
	}

	return nil, errors.New("certificate for identity not found")
}

func (m *SigChain) AddDevice(cryptoImpl keypair.Interface, selfIdentityID, identityID string, publicKey []byte) error {
	currentDevice, err := m.GetCertificateForIdentity(selfIdentityID)

	if err != nil {
		return err
	}

	lastEventHash := m.Events[len(m.Events)-1].Hash

	signedCertificate, err := MakeCertificate(cryptoImpl, publicKey, identityID, currentDevice, lastEventHash)

	if err != nil {
		return err
	}

	payload, err := proto.Marshal(signedCertificate)

	if err != nil {
		return err
	}

	event := SigEvent{
		EventType:  SigEvent_ADD_DEVICE,
		ParentHash: m.Events[len(m.Events)-1].Hash,
		Payload:    payload,
		PublicKey:  publicKey,
		CreatedAt:  time.Now(),
		Issuer:     currentDevice.Content.Issuer,
		Subject:    identityID,
	}

	event.Hash, err = event.ComputeHashForEvent()

	if err != nil {
		return err
	}

	m.Events = append(m.Events, &event)

	return nil
}

func (m *SigChain) RemoveDevice(cryptoImpl keypair.Interface, selfIdentityID, identityID string) error {
	currentCertificate, err := m.GetCertificateForIdentity(selfIdentityID)

	if err != nil {
		return err
	}

	certificate, err := m.GetCertificateForIdentity(identityID)

	if err != nil {
		return err
	}

	lastEventHash := m.Events[len(m.Events)-1].Hash

	signedRevocation, err := MakeRevocation(cryptoImpl, currentCertificate, certificate, lastEventHash)

	if err != nil {
		return err
	}

	payload, err := proto.Marshal(signedRevocation)

	if err != nil {
		return err
	}

	event := SigEvent{
		EventType:  SigEvent_REMOVE_DEVICE,
		ParentHash: m.Events[len(m.Events)-1].Hash,
		Payload:    payload,
		PublicKey:  certificate.Content.PublicKey,
		CreatedAt:  time.Now(),
		Issuer:     currentCertificate.Content.Subject,
		Subject:    certificate.Content.Subject,
	}

	event.Hash, err = event.ComputeHashForEvent()

	if err != nil {
		return err
	}

	m.Events = append(m.Events, &event)

	return nil
}

func MakeRevocation(cryptoImpl keypair.Interface, currentCertificate *keypair.Certificate, certificate *keypair.Certificate, parentEventHash []byte) (*keypair.Revocation, error) {
	extension := EventExtension{}
	extension.Version = EventExtensionVersions_VERSION_1
	extension.ParentEventHash = parentEventHash

	extensionBytes, err := extension.Marshal()

	if err != nil {
		return nil, err
	}

	revocation := keypair.RevocationContent{}
	revocation.Version = keypair.CertRevocationVersions_VERSION_1
	revocation.Issuer = currentCertificate.Content.Subject
	revocation.Subject = certificate.Content.Subject
	revocation.IssuedOn = time.Now()
	revocation.Extension = extensionBytes

	raw, err := revocation.GetDataToSign()

	if err != nil {
		return nil, err
	}

	signature, err := cryptoImpl.Sign(raw)

	if err != nil {
		return nil, err
	}

	sigAlgo := cryptoImpl.SignatureAlgorithm()

	return &keypair.Revocation{
		Content: &revocation,
		Signature: &keypair.Signature{
			Signature:          signature,
			SignatureAlgorithm: sigAlgo,
		},
	}, nil
}

func (m *SigChain) CheckSigChain() (map[string]*keypair.Certificate, error) {
	var lastHash []byte
	var devices = make(map[string]*keypair.Certificate)

	for i := range m.Events {
		event := m.Events[i]

		if bytes.Compare(event.ParentHash, lastHash) != 0 {
			return devices, errors.New("parent hash mismatch")
		}

		switch event.EventType {
		case SigEvent_ADD_DEVICE, SigEvent_INIT_CHAIN:
			var issuerCert *keypair.Certificate
			certificate := &keypair.Certificate{}
			certificateExtension := &EventExtension{}

			if err := certificate.Unmarshal(event.Payload); err != nil {
				return devices, err
			}

			if err := certificateExtension.Unmarshal(certificate.Content.Extension); err != nil {
				return devices, err
			}

			if bytes.Compare(certificateExtension.ParentEventHash, lastHash) != 0 {
				return devices, errors.New("sigchain: certificate parent hash mismatch")
			}

			if event.EventType == SigEvent_ADD_DEVICE {
				if _, ok := devices[certificate.Content.Issuer]; ok == false {
					return devices, errors.New("sigchain: issuer device not found")
				}

				issuerCert = devices[certificate.Content.Issuer]
			} else {
				issuerCert = certificate
			}

			if err := keypair.CheckSignatureUsingCert(certificate, issuerCert); err != nil {
				return devices, err
			}

			devices[certificate.Content.Subject] = certificate

		case SigEvent_REMOVE_DEVICE:
			revocation := &keypair.Revocation{}
			revocationExtension := &EventExtension{}

			if err := revocation.Unmarshal(event.Payload); err != nil {
				return devices, err
			}

			if err := revocationExtension.Unmarshal(revocation.Content.Extension); err != nil {
				return devices, err
			}

			if bytes.Compare(revocationExtension.ParentEventHash, lastHash) != 0 {
				return devices, errors.New("sigchain: revocation parent hash mismatch")
			}

			if _, ok := devices[revocation.Content.Issuer]; ok == false {
				return devices, errors.New("sigchain: subject device not found")
			}

			if _, ok := devices[revocation.Content.Subject]; ok == false {
				return devices, errors.New("sigchain: subject device not found")
			}

			issuerCert := devices[revocation.Content.Issuer]

			if err := keypair.CheckSignatureUsingCert(revocation, issuerCert); err != nil {
				return devices, err
			}

			delete(devices, revocation.Content.Subject)
		}

		lastHash = event.Hash
	}

	return devices, nil
}

func (m *SigEvent) ComputeHashForEvent() ([]byte, error) {
	message := bytes.Join([][]byte{
		m.ParentHash,
		keypair.IntToBytes(uint64(m.EventType)),
		m.Payload,
	}, []byte(""))

	h := crypto.SHA256.New()
	if _, err := h.Write(message); err != nil {
		return nil, err
	}

	return h.Sum(nil), nil
}
