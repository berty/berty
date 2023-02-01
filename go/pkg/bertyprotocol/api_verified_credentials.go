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
		Issuer:             parsedCredential.Issuer.ID,
	})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.CredentialVerificationServiceCompleteFlow_Reply{
		Identifier: identifier,
	}, nil
}

func (s *service) VerifiedCredentialsList(request *protocoltypes.VerifiedCredentialsList_Request, server protocoltypes.ProtocolService_VerifiedCredentialsListServer) error {
	now := time.Now().UnixNano()
	credentials := s.accountGroup.metadataStore.ListVerifiedCredentials()

	for _, credential := range credentials {
		if request.FilterIdentifier != "" && credential.Identifier != request.FilterIdentifier {
			continue
		}

		if request.ExcludeExpired && credential.ExpirationDate < now {
			continue
		}

		if request.FilterIssuer != "" && credential.Issuer != request.FilterIssuer {
			continue
		}

		if err := server.Send(&protocoltypes.VerifiedCredentialsList_Reply{
			Credential: credential,
		}); err != nil {
			return errcode.ErrStreamWrite.Wrap(err)
		}
	}

	return nil
}
