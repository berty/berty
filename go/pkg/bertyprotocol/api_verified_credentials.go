package bertyprotocol

import (
	"bytes"
	"context"
	stdcrypto "crypto"
	"fmt"
	"io"
	"strings"
	"time"

	libp2p_ci "github.com/libp2p/go-libp2p/core/crypto"

	"berty.tech/berty/v2/go/pkg/bertyvcissuer"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type signerWrapper struct {
	libp2p_ci.PrivKey
}

func (s *signerWrapper) Public() stdcrypto.PublicKey {
	return s.PrivKey.GetPublic()
}

func (s *signerWrapper) Sign(_ io.Reader, digest []byte, _ stdcrypto.SignerOpts) (signature []byte, err error) {
	return s.PrivKey.Sign(digest)
}

func (s *service) CredentialVerificationServiceInitFlow(ctx context.Context, request *protocoltypes.CredentialVerificationServiceInitFlow_Request) (*protocoltypes.CredentialVerificationServiceInitFlow_Reply, error) {
	s.lock.Lock()
	s.vcClient = bertyvcissuer.NewClient(request.ServiceURL)
	client := s.vcClient
	s.lock.Unlock()

	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	// TODO: allow selection of alt-scoped keys
	sk, err := s.deviceKeystore.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrInvalidInput
	}

	pkRaw, err := sk.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrInvalidInput
	}

	if !bytes.Equal(pkRaw, request.PublicKey) {
		return nil, errcode.ErrInvalidInput
	}

	url, err := client.Init(ctx, request.Link, &signerWrapper{sk})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.CredentialVerificationServiceInitFlow_Reply{
		URL:       url,
		SecureURL: strings.HasPrefix(url, "https://"),
	}, nil
}

func (s *service) CredentialVerificationServiceCompleteFlow(ctx context.Context, request *protocoltypes.CredentialVerificationServiceCompleteFlow_Request) (*protocoltypes.CredentialVerificationServiceCompleteFlow_Reply, error) {
	s.lock.Lock()
	client := s.vcClient
	s.lock.Unlock()

	if client == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a verification flow needs to be started first"))
	}

	credentials, identifier, parsedCredential, err := client.Complete(request.CallbackURI)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	_, err = s.accountGroup.metadataStore.SendAccountVerifiedCredentialAdded(ctx, &protocoltypes.AccountVerifiedCredentialRegistered{
		VerifiedCredential: credentials,
		RegistrationDate:   parsedCredential.Issued.UnixNano(),
		ExpirationDate:     parsedCredential.Expired.UnixNano(),
		Identifier:         identifier,
	})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.CredentialVerificationServiceCompleteFlow_Reply{
		Identifier: identifier,
	}, nil
}

func (s *service) VerifiedCredentialsList(ctx context.Context, request *protocoltypes.VerifiedCredentialsList_Request) (*protocoltypes.VerifiedCredentialsList_Reply, error) {
	credentials := s.accountGroup.metadataStore.ListVerifiedCredentials()

	return &protocoltypes.VerifiedCredentialsList_Reply{Credentials: credentials}, nil
}
