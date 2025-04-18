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

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/directorytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	weshnet_vc "berty.tech/weshnet/v2/pkg/bertyvcissuer"
	"berty.tech/weshnet/v2/pkg/cryptoutil"
)

func inMinMaxDefault(value, minimum, maximum, def int64) int64 {
	if value < minimum {
		return def
	} else if value > maximum {
		return def
	}

	return value
}

func getBertyURIParts(uri string) ([]byte, []byte, error) {
	parsedURI, err := bertylinks.UnmarshalLink(uri, nil)
	if err != nil {
		return nil, nil, errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	if parsedURI.Kind != messengertypes.BertyLink_ContactInviteV1Kind || parsedURI.BertyId == nil || len(parsedURI.BertyId.AccountPk) == 0 {
		return nil, nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("invalid berty account link"))
	}

	return parsedURI.BertyId.AccountPk, parsedURI.BertyId.PublicRendezvousSeed, nil
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
		return "", errcode.ErrCode_ErrCryptoKeyGeneration.Wrap(err)
	}

	unregisterToken = base64.RawURLEncoding.EncodeToString(randomNonce)
	if err != nil {
		return "", errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	return unregisterToken, nil
}

func generateUUIDIfNeeded(recordToken string) (string, error) {
	if recordToken != "" {
		return recordToken, nil
	}

	uuidv4, err := uuid.NewV4()
	if err != nil {
		return "", errcode.ErrCode_ErrCryptoRandomGeneration.Wrap(err)
	}

	return uuidv4.String(), nil
}

func isExistingRecordBeingRenewed(record *directorytypes.Record, accountPK, accountRDVSeed []byte) (bool, bool, error) {
	if record == nil {
		return false, false, nil
	}

	existingRecordAccountPublicKey, existingRecordAccountRDVSeed, err := getBertyURIParts(record.AccountUri)
	if err != nil {
		return false, false, errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	accountIsIdentical := bytes.Equal(existingRecordAccountPublicKey, accountPK)
	rdvSeedIsIdentical := bytes.Equal(existingRecordAccountRDVSeed, accountRDVSeed)

	return accountIsIdentical, accountIsIdentical && rdvSeedIsIdentical, nil
}

func checkVerifiedCredential(allowedIssuers []string, verifiedCredential []byte, accountPK []byte) (string, error) {
	credentialsOpts := []verifiable.CredentialOpt{verifiable.WithJSONLDDocumentLoader(ld.NewDefaultDocumentLoader(http.DefaultClient))}
	if len(allowedIssuers) == 0 {
		credentialsOpts = append([]verifiable.CredentialOpt{verifiable.WithPublicKeyFetcher(weshnet_vc.EmbeddedPublicKeyFetcher)}, credentialsOpts...)
	} else {
		credentialsOpts = append([]verifiable.CredentialOpt{verifiable.WithPublicKeyFetcher(weshnet_vc.EmbeddedPublicKeyFetcherAllowList(allowedIssuers))}, credentialsOpts...)
	}

	credential, err := verifiable.ParseCredential(verifiedCredential, credentialsOpts...)
	if err != nil {
		return "", errcode.ErrCode_ErrInvalidInput.Wrap(err)
	}

	if credential.Issued == nil || credential.Issued.After(time.Now()) {
		return "", errcode.ErrCode_ErrServicesDirectoryInvalidVerifiedCredential
	}

	if credential.Expired == nil || credential.Expired.Before(time.Now()) {
		return "", errcode.ErrCode_ErrServicesDirectoryExpiredVerifiedCredential
	}

	if credential.Subject == nil {
		return "", errcode.ErrCode_ErrNotFound
	}

	if len(credential.ID) == 0 {
		return "", errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	parsedAccountPK, _, err := getBertyURIParts(credential.ID)
	if err != nil {
		return "", errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	if !bytes.Equal(parsedAccountPK, accountPK) {
		return "", errcode.ErrCode_ErrServicesDirectoryInvalidVerifiedCredentialID
	}

	subject, err := weshnet_vc.ExtractSubjectFromVC(credential)
	if err != nil {
		return "", errcode.ErrCode_ErrServicesDirectoryInvalidVerifiedCredentialSubject.Wrap(err)
	}

	return subject, nil
}
