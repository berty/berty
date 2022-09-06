package bertydirectory

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"github.com/piprate/json-gold/ld"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/bertyvcissuer"
	"berty.tech/berty/v2/go/pkg/directorytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type DirectoryService struct {
	logger            *zap.Logger
	db                *gorm.DB
	defaultExpiration time.Duration
	defaultLockTime   time.Duration
	maxExpiration     time.Duration
	maxLockTime       time.Duration
	allowedIssuers    []string
}

type ServiceOpts struct {
	Logger            *zap.Logger
	DefaultExpiration time.Duration
	DefaultLockTime   time.Duration
	MaxExpiration     time.Duration
	MaxLockTime       time.Duration
	AllowedIssuers    []string
}

func New(db *gorm.DB, opts *ServiceOpts) (*DirectoryService, error) {
	if opts == nil {
		opts = &ServiceOpts{}
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	if opts.DefaultExpiration == 0 {
		opts.DefaultExpiration = time.Hour * 24 * 30
	}

	if opts.DefaultLockTime == 0 {
		opts.DefaultLockTime = time.Hour * 24 * 7
	}

	if opts.MaxExpiration == 0 {
		opts.MaxExpiration = time.Hour * 24 * 60
	}

	if opts.MaxLockTime == 0 {
		opts.MaxLockTime = time.Hour * 24 * 30
	}

	svc := &DirectoryService{
		db:                db,
		defaultExpiration: opts.DefaultExpiration,
		defaultLockTime:   opts.DefaultLockTime,
		maxExpiration:     opts.MaxExpiration,
		maxLockTime:       opts.MaxLockTime,
		allowedIssuers:    opts.AllowedIssuers,
		logger:            opts.Logger,
	}

	if err := db.AutoMigrate(&directorytypes.Record{}); err != nil {
		return nil, err
	}

	return svc, nil
}

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

func (s *DirectoryService) Register(ctx context.Context, request *directorytypes.Register_Request) (*directorytypes.Register_Reply, error) {
	request.ExpirationDate = inMinMaxDefault(request.ExpirationDate, time.Now().UnixNano(), time.Now().UnixNano()+s.defaultExpiration.Nanoseconds(), time.Now().UnixNano()+s.maxExpiration.Nanoseconds())
	request.LockedUntilDate = inMinMaxDefault(request.LockedUntilDate, time.Now().UnixNano(), time.Now().UnixNano()+s.defaultLockTime.Nanoseconds(), time.Now().UnixNano()+s.maxLockTime.Nanoseconds())

	if request.LockedUntilDate > request.ExpirationDate {
		request.LockedUntilDate = request.ExpirationDate
	}

	var record *directorytypes.Record

	requestAccountPublicKey, requestAccountRDVSeed, err := getBertyURIParts(request.ProfileURI)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		directoryIdentifier, err := s.checkVerifiedCredential(request.VerifiedCredential, requestAccountPublicKey)
		if err != nil {
			return errcode.ErrServicesDirectoryInvalidVerifiedCredentialSubject.Wrap(err)
		}

		existingRecord, err := getExistingRecord(tx, directoryIdentifier)
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		existingIsSameAccount, existingIsSameRDVSeed, err := s.isExistingRecordBeingRenewed(existingRecord, requestAccountPublicKey, requestAccountRDVSeed)
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		if existingRecord != nil && (!existingIsSameAccount || !existingIsSameRDVSeed) && existingRecord.ExpiresAt > time.Now().UnixNano() {
			if !request.OverwriteExistingRecord {
				return errcode.ErrServicesDirectoryExplicitReplaceFlagRequired
			}

			if existingRecord.LockedUntil > time.Now().UnixNano() && !existingIsSameAccount {
				return errcode.ErrServicesDirectoryRecordLockedAndCantBeReplaced
			}
		}

		var unlockKey string
		if existingRecord != nil {
			if err := deleteRecordForToken(tx, existingRecord.DirectoryRecordToken); err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}
		}

		if existingIsSameAccount {
			unlockKey = existingRecord.UnlockKey
		} else {
			unlockKey, err = getUnlockKeyAsBase64(request.UnlockKey)
			if err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}
		}

		recordToken, err := tokenForRecord(existingRecord, existingIsSameAccount)
		if err != nil {
			return err
		}

		record, err = s.insertRecord(tx, request, directoryIdentifier, recordToken, unlockKey, request.VerifiedCredential)
		if err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		return nil
	})
	if err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return registerReplyFromRecord(record), nil
}

func (s *DirectoryService) Query(request *directorytypes.Query_Request, server directorytypes.DirectoryService_QueryServer) error {
	for _, identifier := range request.DirectoryIdentifiers {
		result := &directorytypes.Record{}

		if err := s.db.Model(&directorytypes.Record{}).Limit(1).First(&result, "`records`.`directory_identifier` = ? AND `records`.`expires_at` > ?", identifier, time.Now().UnixNano()).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				continue
			}

			return errcode.ErrDBRead.Wrap(err)
		}

		err := server.Send(&directorytypes.Query_Reply{
			DirectoryIdentifier: result.DirectoryIdentifier,
			ExpiresAt:           result.ExpiresAt,
			ProfileURI:          result.ProfileURI,
			VerifiedCredential:  result.VerifiedCredential,
		})
		if err != nil {
			return errcode.ErrStreamWrite.Wrap(err)
		}
	}

	return nil
}

func (s *DirectoryService) Unregister(ctx context.Context, request *directorytypes.Unregister_Request) (*directorytypes.Unregister_Reply, error) {
	existingRecord, err := getExistingRecord(s.db, request.DirectoryIdentifier)
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	if existingRecord == nil || len(existingRecord.UnlockKey) == 0 {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid unlock key"))
	}

	pkBytes, err := base64.StdEncoding.DecodeString(existingRecord.UnlockKey)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	pk, err := p2pcrypto.UnmarshalEd25519PublicKey(pkBytes)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	ok, err := pk.Verify([]byte(existingRecord.DirectoryRecordToken), request.UnlockSig)
	if err != nil {
		return nil, errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	if !ok {
		return nil, errcode.ErrCryptoSignatureVerification.Wrap(fmt.Errorf("signature is invalid"))
	}

	if err := deleteRecordForToken(s.db, existingRecord.DirectoryRecordToken); err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return &directorytypes.Unregister_Reply{}, nil
}

func getExistingRecord(tx *gorm.DB, identifier string) (*directorytypes.Record, error) {
	out := &directorytypes.Record{}

	if err := tx.Model(&directorytypes.Record{}).First(out, &directorytypes.Record{DirectoryIdentifier: identifier}).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}

		return nil, errcode.ErrDBRead.Wrap(err)
	}

	return out, nil
}

func (s *DirectoryService) isExistingRecordBeingRenewed(record *directorytypes.Record, accountPK, accountRDVSeed []byte) (bool, bool, error) {
	if record == nil {
		return false, false, nil
	}

	existingRecordAccountPublicKey, existingRecordAccountRDVSeed, err := getBertyURIParts(record.ProfileURI)
	if err != nil {
		return false, false, errcode.ErrDeserialization.Wrap(err)
	}

	accountIsIdentical := bytes.Equal(existingRecordAccountPublicKey, accountPK)
	rdvSeedIsIdentical := bytes.Equal(existingRecordAccountRDVSeed, accountRDVSeed)

	return accountIsIdentical, accountIsIdentical && rdvSeedIsIdentical, nil
}

func getUnlockKeyAsBase64(unlockKey []byte) (string, error) {
	if unlockKey == nil {
		return "", nil
	}

	parsedUnlockKey, err := p2pcrypto.UnmarshalEd25519PublicKey(unlockKey)
	if err != nil {
		return "", errcode.ErrDeserialization.Wrap(err)
	}

	raw, err := parsedUnlockKey.Raw()
	if err != nil {
		return "", errcode.ErrSerialization.Wrap(err)
	}

	return base64.StdEncoding.EncodeToString(raw), nil
}

func deleteRecordForToken(tx *gorm.DB, token string) error {
	if err := tx.Model(&directorytypes.Record{}).Delete(&directorytypes.Record{}, &directorytypes.Record{DirectoryRecordToken: token}).Error; err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	return nil
}

func tokenForRecord(existingRecord *directorytypes.Record, existingBeingRenewed bool) (string, error) {
	if existingBeingRenewed && existingRecord != nil {
		return existingRecord.DirectoryRecordToken, nil
	}

	uuidv4, err := uuid.NewV4()
	if err != nil {
		return "", errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return uuidv4.String(), nil
}

func (s *DirectoryService) insertRecord(tx *gorm.DB, request *directorytypes.Register_Request, directoryIdentifier, recordToken, unlockKey string, verifiedCred []byte) (*directorytypes.Record, error) {
	record := &directorytypes.Record{
		DirectoryIdentifier:  directoryIdentifier,
		DirectoryRecordToken: recordToken,
		ExpiresAt:            request.ExpirationDate,
		LockedUntil:          request.LockedUntilDate,
		UnlockKey:            unlockKey,
		ProfileURI:           request.ProfileURI,
		VerifiedCredential:   verifiedCred,
	}

	if err := tx.Model(&directorytypes.Record{}).Create(record).Error; err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return record, nil
}

func (s *DirectoryService) checkVerifiedCredential(verifiedCredential []byte, accountPK []byte) (string, error) {
	credentialsOpts := []verifiable.CredentialOpt{verifiable.WithJSONLDDocumentLoader(ld.NewDefaultDocumentLoader(http.DefaultClient))}
	if len(s.allowedIssuers) == 0 {
		credentialsOpts = append([]verifiable.CredentialOpt{verifiable.WithPublicKeyFetcher(bertyvcissuer.EmbeddedPublicKeyFetcher)}, credentialsOpts...)
	} else {
		credentialsOpts = append([]verifiable.CredentialOpt{verifiable.WithPublicKeyFetcher(bertyvcissuer.EmbeddedPublicKeyFetcherAllowList(s.allowedIssuers))}, credentialsOpts...)
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

	if subjectList, ok := credential.Subject.([]verifiable.Subject); ok {
		if len(subjectList) == 0 {
			return "", errcode.ErrNotFound
		}

		return subjectList[0].ID, nil
	}

	return "", errcode.ErrServicesDirectoryInvalidVerifiedCredentialSubject
}

func registerReplyFromRecord(record *directorytypes.Record) *directorytypes.Register_Reply {
	return &directorytypes.Register_Reply{
		DirectoryRecordToken: record.DirectoryRecordToken,
		DirectoryIdentifier:  record.DirectoryIdentifier,
		ExpirationDate:       record.ExpiresAt,
	}
}

var _ directorytypes.DirectoryServiceServer = (*DirectoryService)(nil)
