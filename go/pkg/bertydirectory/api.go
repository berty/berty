package bertydirectory

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/directorytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type DirectoryService struct {
	logger            *zap.Logger
	db                Datastore
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

func New(db Datastore, opts *ServiceOpts) (*DirectoryService, error) {
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

	if len(opts.AllowedIssuers) == 1 && opts.AllowedIssuers[0] == "*" {
		opts.AllowedIssuers = nil
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

	svc.logger.Info("directory service database migrated")

	return svc, nil
}

func (s *DirectoryService) Register(_ context.Context, request *directorytypes.Register_Request) (*directorytypes.Register_Reply, error) {
	expirationDate := inMinMaxDefault(request.ExpirationDate, time.Now().UnixNano(), time.Now().UnixNano()+s.defaultExpiration.Nanoseconds(), time.Now().UnixNano()+s.maxExpiration.Nanoseconds())
	lockedUntilDate := inMinMaxDefault(request.LockedUntilDate, time.Now().UnixNano(), time.Now().UnixNano()+s.defaultLockTime.Nanoseconds(), time.Now().UnixNano()+s.maxLockTime.Nanoseconds())

	if lockedUntilDate > expirationDate {
		lockedUntilDate = expirationDate
	}

	requestAccountPublicKey, requestAccountRDVSeed, err := getBertyURIParts(request.AccountURI)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	directoryIdentifier, err := checkVerifiedCredential(s.allowedIssuers, request.VerifiedCredential, requestAccountPublicKey)
	if err != nil {
		return nil, errcode.ErrServicesDirectoryInvalidVerifiedCredentialSubject.Wrap(err)
	}

	// check if an existing token already exists
	recordToken, unregisterToken, err := s.checkExistingRecord(directoryIdentifier, requestAccountPublicKey, requestAccountRDVSeed, request.OverwriteExistingRecord)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if err := s.db.Put(&directorytypes.Record{
		DirectoryIdentifier:  directoryIdentifier,
		DirectoryRecordToken: recordToken,
		ExpiresAt:            expirationDate,
		LockedUntil:          lockedUntilDate,
		UnregisterToken:      unregisterToken,
		AccountURI:           request.AccountURI,
		VerifiedCredential:   request.VerifiedCredential,
	}); err != nil {
		return nil, err
	}

	return &directorytypes.Register_Reply{
		DirectoryRecordToken: recordToken,
		DirectoryIdentifier:  directoryIdentifier,
		ExpirationDate:       expirationDate,
		UnregisterToken:      unregisterToken,
	}, nil
}

func (s *DirectoryService) checkExistingRecord(directoryIdentifier string, requestAccountPublicKey, requestAccountRDVSeed []byte, overwriteExistingFlag bool) (string, string, error) {
	unregisterToken := ""
	recordToken := ""

	existingRecord, err := s.db.Get(directoryIdentifier)
	if err != nil && err != errcode.ErrNotFound {
		return "", "", err
	}

	if existingRecord != nil {
		existingIsSameAccount, existingIsSameRDVSeed, err := isExistingRecordBeingRenewed(existingRecord, requestAccountPublicKey, requestAccountRDVSeed)
		if err != nil {
			return "", "", errcode.ErrInternal.Wrap(err)
		}

		if (!existingIsSameAccount || !existingIsSameRDVSeed) && existingRecord.ExpiresAt > time.Now().UnixNano() {
			if !overwriteExistingFlag {
				return "", "", errcode.ErrServicesDirectoryExplicitReplaceFlagRequired
			}
			if existingRecord.LockedUntil > time.Now().UnixNano() && !existingIsSameAccount {
				return "", "", errcode.ErrServicesDirectoryRecordLockedAndCantBeReplaced
			}
		}

		if existingIsSameAccount {
			recordToken = existingRecord.DirectoryRecordToken
			unregisterToken = existingRecord.UnregisterToken
		}
	}

	recordToken, unregisterToken, err = generateRecordIdentifiersIfNeeded(recordToken, unregisterToken)
	if err != nil {
		return "", "", err
	}

	return recordToken, unregisterToken, nil
}

func (s *DirectoryService) Query(request *directorytypes.Query_Request, server directorytypes.DirectoryService_QueryServer) error {
	for _, identifier := range request.DirectoryIdentifiers {
		result, err := s.db.Get(identifier)
		if err != nil {
			if err == errcode.ErrNotFound {
				continue
			}

			return err
		}

		err = server.Send(&directorytypes.Query_Reply{
			DirectoryIdentifier: result.DirectoryIdentifier,
			ExpiresAt:           result.ExpiresAt,
			AccountURI:          result.AccountURI,
			VerifiedCredential:  result.VerifiedCredential,
		})
		if err != nil {
			return errcode.ErrStreamWrite.Wrap(err)
		}
	}

	return nil
}

func (s *DirectoryService) Unregister(_ context.Context, request *directorytypes.Unregister_Request) (*directorytypes.Unregister_Reply, error) {
	if request.UnregisterToken == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no unregister token provided"))
	}

	existingRecord, err := s.db.Get(request.DirectoryIdentifier)
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	if existingRecord == nil {
		return nil, errcode.ErrNotFound.Wrap(fmt.Errorf("directory service record not found"))
	}

	if existingRecord.UnregisterToken != request.UnregisterToken || request.UnregisterToken == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid unregister token"))
	}

	if err := s.db.Del(request.DirectoryIdentifier); err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return &directorytypes.Unregister_Reply{}, nil
}

var _ directorytypes.DirectoryServiceServer = (*DirectoryService)(nil)
