package bertyvcissuer

import (
	"crypto/ed25519"
	"fmt"
	"time"

	"github.com/hyperledger/aries-framework-go/component/storageutil/mem"
	ariesDocLD "github.com/hyperledger/aries-framework-go/pkg/doc/ld"
	"github.com/hyperledger/aries-framework-go/pkg/doc/ldcontext/embed"
	"github.com/hyperledger/aries-framework-go/pkg/doc/util"
	"github.com/hyperledger/aries-framework-go/pkg/doc/util/signature"
	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
	"github.com/hyperledger/aries-framework-go/pkg/framework/context"
	ariesld "github.com/hyperledger/aries-framework-go/pkg/store/ld"
)

type CredentialSubject struct {
	ID string `json:"id"`
}

func (i *VCIssuer) initContextStore() error {
	contextStore, err := ariesld.NewContextStore(mem.NewProvider())
	if err != nil {
		return err
	}

	remoteProviderStore, err := ariesld.NewRemoteProviderStore(mem.NewProvider())
	if err != nil {
		return err
	}

	err = contextStore.Import(embed.Contexts)
	if err != nil {
		return err
	}

	ariesContext, err := context.New(
		context.WithJSONLDContextStore(contextStore),
		context.WithJSONLDRemoteProviderStore(remoteProviderStore),
	)
	if err != nil {
		return err
	}

	documentLoader, err := ariesDocLD.NewDocumentLoader(ariesContext)
	if err != nil {
		return err
	}

	i.ariesDocumentLoader = documentLoader

	return nil
}

func (i *VCIssuer) createSignedProof(bertyID string, identifier string) ([]byte, error) {
	now := time.Now()

	vc := &verifiable.Credential{
		Context: []string{
			"https://www.w3.org/2018/credentials/v1",
		},
		ID: bertyID,
		Types: []string{
			"VerifiableCredential",
		},
		Subject: CredentialSubject{
			ID: identifier,
		},
		Issuer: verifiable.Issuer{
			ID: i.issuerID,
		},
		Proofs:  []verifiable.Proof{},
		Issued:  util.NewTime(now),
		Expired: util.NewTime(now.AddDate(1, 0, 0)),
		Schemas: []verifiable.TypedID{},
	}

	signer := signature.GetEd25519Signer(i.issuerSignKey, i.issuerSignKey.Public().(ed25519.PublicKey))

	jwtClaims, err := vc.JWTClaims(true)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal JWT claims of VC: %w", err)
	}

	jws, err := jwtClaims.MarshalJWS(verifiable.EdDSA, signer, "")
	if err != nil {
		return nil, fmt.Errorf("failed to sign VC inside JWT: %w", err)
	}

	return []byte(jws), nil
}
