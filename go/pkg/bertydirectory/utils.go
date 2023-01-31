package bertydirectory

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
	"github.com/piprate/json-gold/ld"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/bertyvcissuer"
	"berty.tech/berty/v2/go/pkg/directorytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func inMinMaxDefault(value, min, max, def int64) int64 {
	if value < min {
		return def
	} else if value > max {
		return def
	}

	return value
}

func getBertyURIParts(uri string) ([]byte, []byte, error) {
	parsedURI, err := bertylinks.UnmarshalLink(uri, nil)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	if parsedURI.Kind != messengertypes.BertyLink_ContactInviteV1Kind || parsedURI.BertyID == nil || len(parsedURI.BertyID.AccountPK) == 0 {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid berty account link"))
	}

	return parsedURI.BertyID.AccountPK, parsedURI.BertyID.PublicRendezvousSeed, nil
}

func generateRecordIdentifiersIfNeeded(recordToken string, unregisterToken string) (string, string, error) {
	recordToken, err := generateUUIDIfNeeded(recordToken)
	if err != nil {
		return "", "", err
	}

	unregisterToken, err = generateUnregisterTokenIfNeeded(unregisterToken)
	if err != nil {
		return "", "", err
	}

	return recordToken, unregisterToken, nil
}

func generateUnregisterTokenIfNeeded(unregisterToken string) (string, error) {
	if unregisterToken != "" {
		return unregisterToken, nil
	}
	randomNonce, err := cryptoutil.GenerateNonceSize(32)
	if err != nil {
		return "", errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	unregisterToken = base64.RawURLEncoding.EncodeToString(randomNonce)
	if err != nil {
		return "", errcode.ErrDeserialization.Wrap(err)
	}

	return unregisterToken, nil
}

func generateUUIDIfNeeded(recordToken string) (string, error) {
	if recordToken != "" {
		return recordToken, nil
	}

	uuidv4, err := uuid.NewV4()
	if err != nil {
		return "", errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return uuidv4.String(), nil
}

func isExistingRecordBeingRenewed(record *directorytypes.Record, accountPK, accountRDVSeed []byte) (bool, bool, error) {
	if record == nil {
		return false, false, nil
	}

	existingRecordAccountPublicKey, existingRecordAccountRDVSeed, err := getBertyURIParts(record.AccountURI)
	if err != nil {
		return false, false, errcode.ErrDeserialization.Wrap(err)
	}

	accountIsIdentical := bytes.Equal(existingRecordAccountPublicKey, accountPK)
	rdvSeedIsIdentical := bytes.Equal(existingRecordAccountRDVSeed, accountRDVSeed)

	return accountIsIdentical, accountIsIdentical && rdvSeedIsIdentical, nil
}

func checkVerifiedCredential(allowedIssuers []string, verifiedCredential []byte, accountPK []byte) (string, error) {
	credentialsOpts := []verifiable.CredentialOpt{verifiable.WithJSONLDDocumentLoader(ld.NewDefaultDocumentLoader(http.DefaultClient))}
	if len(allowedIssuers) == 0 {
		credentialsOpts = append([]verifiable.CredentialOpt{verifiable.WithPublicKeyFetcher(bertyvcissuer.EmbeddedPublicKeyFetcher)}, credentialsOpts...)
	} else {
		credentialsOpts = append([]verifiable.CredentialOpt{verifiable.WithPublicKeyFetcher(bertyvcissuer.EmbeddedPublicKeyFetcherAllowList(allowedIssuers))}, credentialsOpts...)
	}

	credential, err := verifiable.ParseCredential(verifiedCredential, credentialsOpts...)
	if err != nil {
		return "", errcode.ErrInvalidInput.Wrap(err)
	}

	if credential.Issued == nil || credential.Issued.After(time.Now()) {
		return "", errcode.ErrServicesDirectoryInvalidVerifiedCredential
	}

	if credential.Expired == nil || credential.Expired.Before(time.Now()) {
		return "", errcode.ErrServicesDirectoryExpiredVerifiedCredential
	}

	if credential.Subject == nil {
		return "", errcode.ErrNotFound
	}

	if len(credential.ID) == 0 {
		return "", errcode.ErrDeserialization.Wrap(err)
	}

	parsedAccountPK, _, err := getBertyURIParts(credential.ID)
	if err != nil {
		return "", errcode.ErrDeserialization.Wrap(err)
	}

	if !bytes.Equal(parsedAccountPK, accountPK) {
		return "", errcode.ErrServicesDirectoryInvalidVerifiedCredentialID
	}

	subject, err := bertyvcissuer.ExtractSubjectFromVC(credential)
	if err != nil {
		return "", errcode.ErrServicesDirectoryInvalidVerifiedCredentialSubject.Wrap(err)
	}

	return subject, nil
}
