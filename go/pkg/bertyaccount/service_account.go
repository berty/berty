package bertyaccount

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"time"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"moul.io/progress"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const accountMetafileName = "account_meta"

func (s *service) openAccount(req *OpenAccount_Request, prog *progress.Progress) (*AccountMetadata, error) {
	args := req.GetArgs()

	if req.AccountID == "" {
		return nil, errcode.ErrBertyAccountNoIDSpecified
	}

	// close previous initManager
	if s.initManager != nil {
		return nil, errcode.ErrBertyAccountAlreadyOpened
	}

	if strings.ContainsAny(path.Clean(req.AccountID), "/\\") {
		return nil, errcode.ErrBertyAccountInvalidIDFormat
	}

	accountStorePath := path.Join(s.rootdir, req.AccountID)

	if _, err := os.Stat(accountStorePath); err != nil {
		return nil, errcode.ErrBertyAccountDataNotFound.Wrap(err)
	}

	if prog == nil {
		prog = progress.New()
		defer prog.Close()
	}
	prog.AddStep("init")
	prog.AddStep("setup-logger")
	prog.AddStep("setup-manager")
	prog.AddStep("setup-manager-logger")
	prog.AddStep("setup-local-ipfs")
	prog.AddStep("setup-grpc-server")
	prog.AddStep("setup-local-messenger-server")
	prog.AddStep("setup-notification-manager")
	prog.AddStep("setup-grpc-client")
	prog.AddStep("setup-grpc-services")
	prog.AddStep("finishing")
	prog.Get("init").Start()

	args = append(args, "--store.dir", accountStorePath)

	meta, err := s.updateAccountMetadataLastOpened(req.AccountID)
	if err != nil {
		return nil, errcode.ErrBertyAccountMetadataUpdate.Wrap(err)
	}

	// setup manager logger
	prog.Get("setup-logger").SetAsCurrent()
	logger := s.logger
	{
		var err error
		if filters := req.LoggerFilters; filters != "" {
			if logger, _, err = logutil.DecorateLogger(logger, filters); err != nil {
				return nil, errcode.ErrBertyAccountLoggerDecorator.Wrap(err)
			}
		}
	}
	s.logger.Info("opening account", zap.Strings("args", args), zap.String("account-id", req.AccountID))

	// setup manager
	prog.Get("setup-manager").SetAsCurrent()
	var initManager *initutil.Manager
	{
		var err error
		if initManager, err = s.openManager(logger, args...); err != nil {
			return nil, errcode.ErrBertyAccountManagerOpen.Wrap(err)
		}
	}

	errCleanup := func() {
		initManager.Close(nil)
	}

	// setup manager logger
	prog.Get("setup-manager-logger").SetAsCurrent()
	{
		if _, err = initManager.GetLogger(); err != nil {
			errCleanup()
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// setup local IPFS
	prog.Get("setup-local-ipfs").SetAsCurrent()
	{
		if _, _, err = initManager.GetLocalIPFS(); err != nil {
			errCleanup()
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// setup gRPC server
	prog.Get("setup-grpc-server").SetAsCurrent()
	var srvServices *grpc.Server
	{
		var err error
		if srvServices, _, err = initManager.GetGRPCServer(); err != nil {
			errCleanup()
			return nil, errcode.ErrBertyAccountGRPCClient.Wrap(err)
		}
	}

	// setup local messenger server
	prog.Get("setup-local-messenger-server").SetAsCurrent()
	{
		if _, err = initManager.GetLocalMessengerServer(); err != nil {
			errCleanup()
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// setup notification manager
	prog.Get("setup-notification-manager").SetAsCurrent()
	{
		if _, err = initManager.GetNotificationManager(); err != nil {
			errCleanup()
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// setup gRPC client
	prog.Get("setup-grpc-client").SetAsCurrent()
	var ccServices *grpc.ClientConn
	{
		if ccServices, err = initManager.GetGRPCClientConn(); err != nil {
			errCleanup()
			return nil, errcode.ErrBertyAccountGRPCClient.Wrap(err)
		}
	}

	// register gRPC services
	prog.Get("setup-grpc-services").SetAsCurrent()
	{
		if s.sclients != nil {
			for serviceName := range srvServices.GetServiceInfo() {
				s.sclients.RegisterService(serviceName, ccServices)
			}
		}
	}

	s.initManager = initManager
	prog.Get("finishing").SetAsCurrent().Done()

	return meta, nil
}

// OpenAccount starts a Berty node.
func (s *service) OpenAccount(_ context.Context, req *OpenAccount_Request) (*OpenAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	if _, err := s.openAccount(req, nil); err != nil {
		return nil, errcode.ErrBertyAccountOpenAccount.Wrap(err)
	}

	return &OpenAccount_Reply{}, nil
}

// OpenAccountWithProgress is similar to OpenAccount, but also streams the progress.
func (s *service) OpenAccountWithProgress(req *OpenAccountWithProgress_Request, server AccountService_OpenAccountWithProgressServer) error {
	s.muService.Lock()
	defer s.muService.Unlock()

	prog := progress.New()
	defer prog.Close()
	ch := prog.Subscribe()
	done := make(chan bool)

	go func() {
		for step := range ch {
			_ = step
			snapshot := prog.Snapshot()
			err := server.Send(&OpenAccountWithProgress_Reply{
				Progress: &protocoltypes.Progress{
					State:     string(snapshot.State),
					Doing:     snapshot.Doing,
					Progress:  float32(snapshot.Progress),
					Completed: uint64(snapshot.Completed),
					Total:     uint64(snapshot.Total),
					Delay:     uint64(snapshot.TotalDuration.Microseconds()),
				},
			})
			if err != nil {
				// not sure it is worth logging something here
				break
			}
		}
		done <- true
	}()

	// FIXME: replace with a helper that json unmarshal + directly remashal, to avoid being unsynced?
	typed := OpenAccount_Request{
		Args:          req.Args,
		AccountID:     req.AccountID,
		LoggerFilters: req.LoggerFilters,
	}
	if _, err := s.openAccount(&typed, prog); err != nil {
		return errcode.ErrBertyAccountOpenAccount.Wrap(err)
	}

	// wait
	<-done

	return nil
}

func (s *service) CloseAccount(_ context.Context, req *CloseAccount_Request) (*CloseAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	if s.initManager == nil {
		return &CloseAccount_Reply{}, nil
	}

	if l, err := s.initManager.GetLogger(); err == nil {
		_ = l.Sync() // cleanup logger
	}

	if err := s.initManager.Close(nil); err != nil {
		s.logger.Warn("unable to close account", zap.Error(err))
		return nil, errcode.ErrBertyAccountManagerClose.Wrap(err)
	}
	s.initManager = nil

	return &CloseAccount_Reply{}, nil
}

func (s *service) CloseAccountWithProgress(req *CloseAccountWithProgress_Request, server AccountService_CloseAccountWithProgressServer) error {
	s.muService.Lock()
	defer s.muService.Unlock()

	if s.initManager == nil {
		return nil
	}

	prog := progress.New()
	defer prog.Close()
	ch := prog.Subscribe()
	done := make(chan bool)

	go func() {
		for step := range ch {
			_ = step
			snapshot := prog.Snapshot()
			err := server.Send(&CloseAccountWithProgress_Reply{
				Progress: &protocoltypes.Progress{
					State:     string(snapshot.State),
					Doing:     snapshot.Doing,
					Progress:  float32(snapshot.Progress),
					Completed: uint64(snapshot.Completed),
					Total:     uint64(snapshot.Total),
					Delay:     uint64(snapshot.TotalDuration.Microseconds()),
				},
			})
			if err != nil {
				// not sure it is worth logging something here
				break
			}
		}
		done <- true
	}()

	if l, err := s.initManager.GetLogger(); err == nil {
		_ = l.Sync() // cleanup logger
	}

	if err := s.initManager.Close(prog); err != nil {
		s.logger.Warn("unable to close account", zap.Error(err))
		return errcode.ErrBertyAccountManagerClose.Wrap(err)
	}
	s.initManager = nil

	// wait
	<-done

	return nil
}

func (s *service) openManager(logger *zap.Logger, args ...string) (*initutil.Manager, error) {
	manager := initutil.Manager{}

	// configure flagset options
	fs := flag.NewFlagSet("account", flag.ContinueOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalMessengerServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)

	// manager.SetupMetricsFlags(fs)
	err := fs.Parse(args)
	if err != nil {
		return nil, errcode.ErrBertyAccountInvalidCLIArgs.Wrap(err)
	}
	if len(fs.Args()) > 0 {
		return nil, errcode.ErrBertyAccountInvalidCLIArgs.Wrap(fmt.Errorf("invalid CLI args, should only have flags"))
	}

	// minimal requirements
	{
		// here we can add various checks that return an error early if some settings are invalid or missing
	}

	// set custom drivers
	manager.SetLogger(logger)
	manager.SetNotificationManager(s.notifManager)
	manager.SetBleDriver(s.bleDriver)
	manager.SetNBDriver(s.nbDriver)

	s.logger.Info("init", zap.Any("manager", &manager))
	return &manager, nil
}

func (s *service) ListAccounts(_ context.Context, _ *ListAccounts_Request) (*ListAccounts_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	if _, err := os.Stat(s.rootdir); os.IsNotExist(err) {
		return &ListAccounts_Reply{
			Accounts: []*AccountMetadata{},
		}, nil
	} else if err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	subitems, err := ioutil.ReadDir(s.rootdir)
	if err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	var accounts []*AccountMetadata

	for _, subitem := range subitems {
		if !subitem.IsDir() {
			continue
		}

		account, err := s.getAccountMetaForName(subitem.Name())
		if err != nil {
			accounts = append(accounts, &AccountMetadata{Error: err.Error(), AccountID: subitem.Name()})
		} else {
			accounts = append(accounts, account)
		}
	}

	return &ListAccounts_Reply{
		Accounts: accounts,
	}, nil
}

func (s *service) getAccountMetaForName(accountID string) (*AccountMetadata, error) {
	metafileName := path.Join(s.rootdir, accountID, accountMetafileName)

	metaBytes, err := ioutil.ReadFile(metafileName)
	if os.IsNotExist(err) {
		return nil, errcode.ErrBertyAccountDataNotFound
	} else if err != nil {
		s.logger.Warn("unable to read account metadata", zap.Error(err), zap.String("account-id", accountID))
		return nil, errcode.ErrBertyAccountFSError.Wrap(fmt.Errorf("unable to read account metadata: %w", err))
	}

	meta := &AccountMetadata{}
	if err := proto.Unmarshal(metaBytes, meta); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(fmt.Errorf("unable to unmarshall account metadata: %w", err))
	}

	meta.AccountID = accountID

	return meta, nil
}

func (s *service) DeleteAccount(_ context.Context, request *DeleteAccount_Request) (*DeleteAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	if s.initManager != nil {
		return nil, errcode.ErrBertyAccountAlreadyOpened
	}

	if request.AccountID == "" {
		return nil, errcode.ErrBertyAccountNoIDSpecified
	}

	if _, err := s.getAccountMetaForName(request.AccountID); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if err := os.RemoveAll(path.Join(s.rootdir, request.AccountID)); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	return &DeleteAccount_Reply{}, nil
}

func (s *service) updateAccountMetadataLastOpened(accountID string) (*AccountMetadata, error) {
	meta, err := s.getAccountMetaForName(accountID)
	if err != nil {
		return nil, err
	}

	meta.LastOpened = time.Now().UnixNano() / 1000

	metaBytes, err := proto.Marshal(meta)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	metafileName := path.Join(s.rootdir, accountID, accountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = accountID

	return meta, nil
}

func (s *service) createAccountMetadata(accountID string, name string) (*AccountMetadata, error) {
	if _, err := s.getAccountMetaForName(accountID); err == nil {
		return nil, errcode.ErrBertyAccountAlreadyExists
	} else if !errcode.Is(err, errcode.ErrBertyAccountDataNotFound) {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	accountStorePath := path.Join(s.rootdir, accountID)
	if err := os.MkdirAll(accountStorePath, 0o700); err != nil {
		return nil, err
	}

	meta := &AccountMetadata{
		Name: name,
	}

	if name == "" {
		meta.Name = accountID
	}

	meta.LastOpened = time.Now().UnixNano() / 1000
	meta.CreationDate = meta.LastOpened

	metaBytes, err := proto.Marshal(meta)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	metafileName := path.Join(s.rootdir, accountID, accountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = accountID

	return meta, nil
}

func (s *service) ImportAccount(ctx context.Context, req *ImportAccount_Request) (*ImportAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	if req.BackupPath == "" {
		return nil, errcode.ErrBertyAccountNoBackupSpecified
	}

	if stat, err := os.Stat(req.BackupPath); err != nil {
		return nil, errcode.ErrBertyAccountDataNotFound.Wrap(err)
	} else if stat.IsDir() {
		return nil, errcode.ErrBertyAccountDataNotFound.Wrap(fmt.Errorf("specified path is a directory"))
	}

	s.logger.Info("importing berty messenger account", zap.String("path", req.BackupPath))

	meta, err := s.createAccount(&CreateAccount_Request{
		AccountID:     req.AccountID,
		AccountName:   req.AccountName,
		Args:          append(req.Args, "-node.restore-export-path", req.BackupPath),
		LoggerFilters: req.LoggerFilters,
	})
	if err != nil {
		return nil, err
	}

	p, err := s.initManager.GetMessengerClient()
	if err != nil {
		return nil, err
	}

	a, err := p.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	if err != nil {
		return nil, err
	}

	meta, err = s.updateAccount(&UpdateAccount_Request{
		AccountID:   meta.AccountID,
		AccountName: a.Account.DisplayName,
		PublicKey:   a.Account.PublicKey,
		AvatarCID:   a.Account.AvatarCID,
	})
	if err != nil {
		return nil, errcode.ErrBertyAccountUpdateFailed.Wrap(err)
	}

	return &ImportAccount_Reply{
		AccountMetadata: meta,
	}, nil
}

func (s *service) createAccount(req *CreateAccount_Request) (*AccountMetadata, error) {
	if req.AccountID != "" {
		if _, err := s.getAccountMetaForName(req.AccountID); err == nil {
			return nil, errcode.ErrBertyAccountAlreadyExists
		}
	} else {
		var err error

		req.AccountID, err = s.generateNewAccountID()
		if err != nil {
			return nil, err
		}
	}

	_, err := s.createAccountMetadata(req.AccountID, req.AccountName)
	if err != nil {
		return nil, err
	}

	meta, err := s.openAccount(&OpenAccount_Request{
		Args:          req.Args,
		AccountID:     req.AccountID,
		LoggerFilters: req.LoggerFilters,
	}, nil)
	if err != nil {
		return nil, err
	}

	return meta, nil
}

func (s *service) CreateAccount(_ context.Context, req *CreateAccount_Request) (*CreateAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	meta, err := s.createAccount(req)
	if err != nil {
		return nil, errcode.ErrBertyAccountCreationFailed.Wrap(err)
	}

	return &CreateAccount_Reply{
		AccountMetadata: meta,
	}, nil
}

func (s *service) updateAccount(req *UpdateAccount_Request) (*AccountMetadata, error) {
	meta, err := s.getAccountMetaForName(req.AccountID)
	if err != nil {
		return nil, err
	}

	meta.LastOpened = time.Now().UnixNano() / 1000
	if req.AccountName != "" {
		meta.Name = req.AccountName
	}
	if req.AvatarCID != "" {
		meta.AvatarCID = req.AvatarCID
	}
	if req.PublicKey != "" {
		meta.PublicKey = req.PublicKey
	}

	metaBytes, err := proto.Marshal(meta)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	metafileName := path.Join(s.rootdir, req.AccountID, accountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = req.AccountID

	return meta, nil
}

func (s *service) UpdateAccount(_ context.Context, req *UpdateAccount_Request) (*UpdateAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	meta, err := s.updateAccount(req)
	if err != nil {
		return nil, errcode.ErrBertyAccountUpdateFailed.Wrap(err)
	}

	return &UpdateAccount_Reply{
		AccountMetadata: meta,
	}, nil
}

func (s *service) generateNewAccountID() (string, error) {
	for i := 0; ; i++ {
		candidateID := fmt.Sprintf("%d", i)

		accountDir := path.Join(s.rootdir, candidateID)
		_, err := os.Stat(accountDir)
		if os.IsNotExist(err) {
			return candidateID, nil
		}

		if err != nil {
			return "", errcode.ErrBertyAccountIDGenFailed.Wrap(err)
		}
	}
}
