package bertyaccount

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gogo/protobuf/proto"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"moul.io/progress"
	"moul.io/u"

	nb "berty.tech/berty/v2/go/internal/androidnearby"
	"berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/logutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
	"berty.tech/berty/v2/go/pkg/username"
)

const (
	accountMetafileName    = "account_meta"
	accountNetConfFileName = "account_net_conf"
)

func (s *service) openAccount(req *OpenAccount_Request, prog *progress.Progress) (*AccountMetadata, error) {
	args := req.GetArgs()

	if req.NetworkConfig == nil {
		req.NetworkConfig, _ = s.NetworkConfigForAccount(req.AccountID)
	}
	req.Args = req.NetworkConfig.AddArgs(req.Args)

	if req.AccountID == "" {
		return nil, errcode.ErrBertyAccountNoIDSpecified
	}

	// close previous initManager
	if s.initManager != nil {
		return nil, errcode.ErrBertyAccountAlreadyOpened
	}

	if strings.ContainsAny(filepath.Clean(req.AccountID), "/\\") {
		return nil, errcode.ErrBertyAccountInvalidIDFormat
	}

	accountStorePath := filepath.Join(s.rootdir, req.AccountID)

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

	errCleanup := func() {}

	// setup manager logger
	prog.Get("setup-logger").SetAsCurrent()
	streams := []logutil.Stream(nil)
	{
		if req.LoggerFilters == "" {
			req.LoggerFilters = "debug+:bty*,-*.grpc warn+:*.grpc error+:*"
		}

		nativeLoggerStream := logutil.NewCustomStream(req.LoggerFilters, s.logger)
		streams = append(streams, nativeLoggerStream)
	}
	s.logger.Info("opening account", zap.Strings("args", args), zap.String("account-id", req.AccountID))

	// setup manager
	prog.Get("setup-manager").SetAsCurrent()
	var initManager *initutil.Manager
	{
		var err error
		if initManager, err = s.openManager(streams, args...); err != nil {
			return nil, errcode.ErrBertyAccountManagerOpen.Wrap(err)
		}
	}

	errCleanup = u.CombineFuncs(errCleanup, func() { initManager.Close(nil) })

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
func (s *service) OpenAccount(ctx context.Context, req *OpenAccount_Request) (_ *OpenAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(ctx, s.logger, fmt.Sprintf("Opening account %s (AccountService)", req.AccountID))
	defer func() { endSection(err) }()

	if _, err := s.openAccount(req, nil); err != nil {
		return nil, errcode.ErrBertyAccountOpenAccount.Wrap(err)
	}

	return &OpenAccount_Reply{}, nil
}

// OpenAccountWithProgress is similar to OpenAccount, but also streams the progress.
func (s *service) OpenAccountWithProgress(req *OpenAccountWithProgress_Request, server AccountService_OpenAccountWithProgressServer) (err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(
		server.Context(),
		s.logger,
		fmt.Sprintf("Opening account %s with progress (AccountService)", req.AccountID),
	)
	defer func() { endSection(err) }()

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

func (s *service) CloseAccount(ctx context.Context, req *CloseAccount_Request) (_ *CloseAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(ctx, s.logger, "Closing account (AccountService)")
	defer func() { endSection(err) }()

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

func (s *service) CloseAccountWithProgress(req *CloseAccountWithProgress_Request, server AccountService_CloseAccountWithProgressServer) (err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(server.Context(), s.logger, "Closing account with progress (AccountService)")
	defer func() { endSection(err) }()

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

func (s *service) openManager(defaultLoggerStreams []logutil.Stream, args ...string) (*initutil.Manager, error) {
	manager, err := initutil.New(context.Background(), &initutil.ManagerOpts{
		DoNotSetDefaultDir:   true,
		DefaultLoggerStreams: defaultLoggerStreams,
	})
	if err != nil {
		panic(err)
	}

	// configure flagset options
	fs := flag.NewFlagSet("account", flag.ContinueOnError)
	manager.Session.Kind = "mobile" // FIXME: allow setting the session kind from the initialization of this package
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalMessengerServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)

	// manager.SetupMetricsFlags(fs)
	err = fs.Parse(args)
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
	manager.SetNotificationManager(s.notifManager)
	manager.SetBleDriver(s.bleDriver)
	manager.SetNBDriver(s.nbDriver)

	return manager, nil
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
	metafileName := filepath.Join(s.rootdir, accountID, accountMetafileName)

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

func (s *service) DeleteAccount(ctx context.Context, request *DeleteAccount_Request) (_ *DeleteAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(
		ctx,
		s.logger,
		fmt.Sprintf("Deleting account %s (AccountService)", request.AccountID),
	)
	defer func() { endSection(err) }()

	if s.initManager != nil {
		return nil, errcode.ErrBertyAccountAlreadyOpened
	}

	if request.AccountID == "" {
		return nil, errcode.ErrBertyAccountNoIDSpecified
	}

	if _, err := s.getAccountMetaForName(request.AccountID); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if err := os.RemoveAll(filepath.Join(s.rootdir, request.AccountID)); err != nil {
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

	metafileName := filepath.Join(s.rootdir, accountID, accountMetafileName)
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

	accountStorePath := filepath.Join(s.rootdir, accountID)
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

	metafileName := filepath.Join(s.rootdir, accountID, accountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = accountID

	return meta, nil
}

func (s *service) ImportAccountWithProgress(req *ImportAccountWithProgress_Request, server AccountService_ImportAccountWithProgressServer) (err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(
		server.Context(),
		s.logger,
		fmt.Sprintf("Importing account %q from path %q with progress (AccountService)",
			req.GetAccountID(),
			req.GetBackupPath(),
		),
	)
	defer func() { endSection(err) }()

	prog := progress.New()
	defer prog.Close()
	ch := prog.Subscribe()
	done := make(chan bool)

	go func() {
		for step := range ch {
			_ = step
			snapshot := prog.Snapshot()
			err := server.Send(&ImportAccountWithProgress_Reply{
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

	typed := ImportAccount_Request{
		AccountName:   req.GetAccountName(),
		BackupPath:    req.GetBackupPath(),
		Args:          req.GetArgs(),
		AccountID:     req.GetAccountID(),
		LoggerFilters: req.GetLoggerFilters(),
		NetworkConfig: req.GetNetworkConfig(),
	}
	ret, err := s.importAccount(server.Context(), &typed, prog)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	// wait
	<-done

	// send reply
	{
		err = server.Send(&ImportAccountWithProgress_Reply{
			AccountMetadata: ret.AccountMetadata,
		})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (s *service) ImportAccount(ctx context.Context, req *ImportAccount_Request) (_ *ImportAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(
		ctx,
		s.logger,
		fmt.Sprintf("Importing account %q with id %q (AccountService)",
			req.AccountName, req.AccountID,
		),
	)
	defer func() { endSection(err) }()

	ret, err := s.importAccount(ctx, req, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return ret, nil
}

func (s *service) importAccount(ctx context.Context, req *ImportAccount_Request, prog *progress.Progress) (_ *ImportAccount_Reply, err error) {
	if prog == nil {
		prog = progress.New()
		defer prog.Close()
	}
	// FIXME: add import specific steps

	// check input
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
		NetworkConfig: req.NetworkConfig,
	}, prog)
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

func (s *service) createAccount(req *CreateAccount_Request, prog *progress.Progress) (*AccountMetadata, error) {
	if prog == nil {
		prog = progress.New()
		defer prog.Close()
	}
	// FIXME: add create specific steps

	if req.AccountID != "" {
		if _, err := s.getAccountMetaForName(req.AccountID); err == nil {
			return nil, errcode.ErrBertyAccountAlreadyExists
		}
	} else {
		var err error

		req.AccountID, err = s.generateNewAccountID()
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	_, err := s.createAccountMetadata(req.AccountID, req.AccountName)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if req.NetworkConfig == nil {
		req.NetworkConfig = NetworkConfigGetBlank()
	}

	if err := s.saveNetworkConfigForAccount(req.AccountID, req.NetworkConfig); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	meta, err := s.openAccount(&OpenAccount_Request{
		Args:          req.Args,
		AccountID:     req.AccountID,
		LoggerFilters: req.LoggerFilters,
		NetworkConfig: req.NetworkConfig,
	}, prog)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return meta, nil
}

func (s *service) CreateAccount(ctx context.Context, req *CreateAccount_Request) (_ *CreateAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(ctx,
		s.logger,
		fmt.Sprintf("Creating account '%s' with id '%s' (AccountService)",
			req.GetAccountName(), req.GetAccountID(),
		),
	)
	defer func() { endSection(err) }()

	meta, err := s.createAccount(req, nil)
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

	metafileName := filepath.Join(s.rootdir, req.AccountID, accountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = req.AccountID

	return meta, nil
}

func (s *service) UpdateAccount(ctx context.Context, req *UpdateAccount_Request) (_ *UpdateAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(
		ctx,
		s.logger,
		fmt.Sprintf("Updating account %s (AccountService)", req.AccountID),
	)
	defer func() { endSection(err) }()

	meta, err := s.updateAccount(req)
	if err != nil {
		return nil, errcode.ErrBertyAccountUpdateFailed.Wrap(err)
	}

	return &UpdateAccount_Reply{
		AccountMetadata: meta,
	}, nil
}

func (s *service) GetUsername(_ context.Context, _ *GetUsername_Request) (_ *GetUsername_Reply, err error) {
	return &GetUsername_Reply{
		Username: username.GetUsername(),
	}, nil
}

func (s *service) generateNewAccountID() (string, error) {
	for i := 0; ; i++ {
		candidateID := fmt.Sprintf("%d", i)

		accountDir := filepath.Join(s.rootdir, candidateID)
		_, err := os.Stat(accountDir)
		if os.IsNotExist(err) {
			return candidateID, nil
		}

		if err != nil {
			return "", errcode.ErrBertyAccountIDGenFailed.Wrap(err)
		}
	}
}

func NetworkConfigGetDefault() *NetworkConfig {
	defaultRDVPeerMaddrs := make([]string, len(config.Config.P2P.RDVP))
	for i := range config.Config.P2P.RDVP {
		defaultRDVPeerMaddrs[i] = config.Config.P2P.RDVP[i].Maddr
	}

	return &NetworkConfig{
		Bootstrap:                  ipfs_cfg.DefaultBootstrapAddresses,
		Rendezvous:                 defaultRDVPeerMaddrs,
		StaticRelay:                config.Config.P2P.StaticRelays,
		DHT:                        NetworkConfig_DHTClient,
		BluetoothLE:                NetworkConfig_Disabled,
		AndroidNearby:              NetworkConfig_Disabled,
		AppleMultipeerConnectivity: NetworkConfig_Disabled,
		MDNS:                       NetworkConfig_Enabled,
		Tor:                        NetworkConfig_TorDisabled,
	}
}

func NetworkConfigGetBlank() *NetworkConfig {
	return &NetworkConfig{
		Bootstrap:                  []string{":default:"},
		Rendezvous:                 []string{":default:"},
		StaticRelay:                []string{":default:"},
		DHT:                        NetworkConfig_DHTUndefined,
		BluetoothLE:                NetworkConfig_Undefined,
		AndroidNearby:              NetworkConfig_Undefined,
		AppleMultipeerConnectivity: NetworkConfig_Undefined,
		MDNS:                       NetworkConfig_Undefined,
		Tor:                        NetworkConfig_TorUndefined,
	}
}

func (s *service) NetworkConfigForAccount(accountID string) (*NetworkConfig, bool) {
	netConfName := filepath.Join(s.rootdir, accountID, accountNetConfFileName)
	netConfBytes, err := ioutil.ReadFile(netConfName)
	if os.IsNotExist(err) {
		return NetworkConfigGetDefault(), false
	} else if err != nil {
		s.logger.Warn("unable to read network configuration for account", zap.Error(err), zap.String("account-id", accountID))
		return NetworkConfigGetDefault(), false
	}

	ret := &NetworkConfig{}
	if err := ret.Unmarshal(netConfBytes); err != nil {
		s.logger.Warn("unable to parse network configuration for account", zap.Error(err), zap.String("account-id", accountID))
		return NetworkConfigGetDefault(), false
	}

	return ret, true
}

func (s *service) NetworkConfigGet(ctx context.Context, request *NetworkConfigGet_Request) (*NetworkConfigGet_Reply, error) {
	defaultConfig := NetworkConfigGetDefault()
	currentConfig, isCustomConfig := s.NetworkConfigForAccount(request.AccountID)

	return &NetworkConfigGet_Reply{
		DefaultConfig:      defaultConfig,
		CurrentConfig:      currentConfig,
		CustomConfigExists: isCustomConfig,
		DefaultBootstrap:   ipfs_cfg.DefaultBootstrapAddresses,
		DefaultRendezvous:  config.GetDefaultRDVPMaddr(),
		DefaultStaticRelay: config.Config.P2P.StaticRelays,
	}, nil
}

func (s *service) saveNetworkConfigForAccount(accountID string, networkConfig *NetworkConfig) error {
	if networkConfig == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no network config provided"))
	}

	data, err := networkConfig.Marshal()
	if err != nil {
		return err
	}

	netConfName := filepath.Join(s.rootdir, accountID, accountNetConfFileName)
	if err := ioutil.WriteFile(netConfName, data, 0o600); err != nil {
		return err
	}

	return nil
}

func (s *service) NetworkConfigSet(ctx context.Context, request *NetworkConfigSet_Request) (*NetworkConfigSet_Reply, error) {
	if err := s.saveNetworkConfigForAccount(request.AccountID, request.Config); err != nil {
		return nil, err
	}

	return &NetworkConfigSet_Reply{}, nil
}

func (m *NetworkConfig) AddArgs(args []string) []string {
	defaultConfig := NetworkConfigGetDefault()
	hasTorFlag := ArgsHasWithPrefix(args, initutil.FlagNameTorMode)
	hasMDNSFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PMDNS)
	staticRelaysFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PStaticRelays)
	hasBootstrapFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PBootstrap)

	args = m.addRadioArgs(args, defaultConfig)

	if !hasTorFlag {
		torFlag := m.Tor
		if torFlag == NetworkConfig_TorUndefined {
			torFlag = defaultConfig.Tor
		}

		switch torFlag {
		case NetworkConfig_TorUndefined, NetworkConfig_TorDisabled:
			args = append(args, ArgSet(initutil.FlagNameTorMode, "disabled"))
		case NetworkConfig_TorOptional:
			args = append(args, ArgSet(initutil.FlagNameTorMode, "optional"))
		case NetworkConfig_TorRequired:
			args = append(args, ArgSet(initutil.FlagNameTorMode, "required"))
		}
	}

	if !hasMDNSFlag {
		mdnsFlag := m.MDNS
		if mdnsFlag == NetworkConfig_Undefined {
			mdnsFlag = defaultConfig.MDNS
		}

		switch mdnsFlag {
		case NetworkConfig_Undefined, NetworkConfig_Disabled:
			args = append(args, ArgSet(initutil.FlagNameP2PMDNS, "true"))

		case NetworkConfig_Enabled:
			args = append(args, ArgSet(initutil.FlagNameP2PMDNS, "false"))
		}
	}

	if !staticRelaysFlag {
		staticRelays := m.StaticRelay
		if len(staticRelays) == 0 {
			staticRelays = []string{initutil.KeywordNone}
		}

		args = append(args, ArgSet(initutil.FlagNameP2PStaticRelays, strings.Join(staticRelays, ",")))
	}

	if !hasBootstrapFlag {
		bootstrapNodes := m.Bootstrap
		if len(bootstrapNodes) == 0 {
			bootstrapNodes = []string{initutil.KeywordNone}
		}

		args = append(args, ArgSet(initutil.FlagNameP2PStaticRelays, strings.Join(bootstrapNodes, ",")))
	}

	args = m.addDHTArgs(args, defaultConfig)
	args = m.addRDVPArgs(args, defaultConfig)

	return args
}

func (m *NetworkConfig) addRDVPArgs(args []string, defaultConfig *NetworkConfig) []string {
	hasRDVPFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PRDVP)
	hasTinderRDVPDriverFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PTinderRDVPDriver)

	rdvpDisabled := false
	if !hasRDVPFlag {
		rdvpHosts := m.Rendezvous
		if len(m.Rendezvous) == 0 {
			rdvpHosts = defaultConfig.Rendezvous
		}

		if len(rdvpHosts) == 0 {
			rdvpHosts = []string{initutil.KeywordNone}
		}

		for _, val := range rdvpHosts {
			if val == initutil.KeywordNone {
				rdvpDisabled = true
				break
			}
		}

		args = append(args, ArgSet(initutil.FlagNameP2PRDVP, strings.Join(rdvpHosts, ",")))
	}

	if !hasTinderRDVPDriverFlag {
		if !rdvpDisabled {
			args = append(args, ArgSet(initutil.FlagNameP2PTinderRDVPDriver, "true"))
		} else {
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, "false"))
		}
	}

	return args
}

func (m *NetworkConfig) addDHTArgs(args []string, defaultConfig *NetworkConfig) []string {
	hasTinderDHTDriverFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PTinderDHTDriver)
	hasDHTFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PDHT)

	dhtDisabled := false
	if !hasDHTFlag {
		dhtFlag := m.DHT
		if dhtFlag == NetworkConfig_DHTUndefined {
			dhtFlag = defaultConfig.DHT
		}

		switch dhtFlag {
		case NetworkConfig_DHTClient:
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, initutil.FlagValueP2PDHTClient))

		case NetworkConfig_DHTServer:
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, initutil.FlagValueP2PDHTServer))

		case NetworkConfig_DHTAuto:
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, initutil.FlagValueP2PDHTAuto))

		case NetworkConfig_DHTAutoServer:
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, initutil.FlagValueP2PDHTAutoServer))

		case NetworkConfig_DHTDisabled, NetworkConfig_DHTUndefined:
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, initutil.FlagValueP2PDHTDisabled))
			dhtDisabled = true
		}
	}

	if !hasTinderDHTDriverFlag {
		if !dhtDisabled {
			args = append(args, ArgSet(initutil.FlagNameP2PTinderDHTDriver, "true"))
		} else {
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, "false"))
		}
	}

	return args
}

func (m *NetworkConfig) addRadioArgs(args []string, defaultConfig *NetworkConfig) []string {
	hasBleFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PBLE)
	hasP2PMCFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PMultipeerConnectivity)
	hasP2PNearbyFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PNearby)

	if !hasBleFlag {
		val := m.BluetoothLE
		if val == NetworkConfig_Undefined {
			val = defaultConfig.BluetoothLE
		}

		if ble.Supported && val == NetworkConfig_Enabled {
			args = append(args, ArgSet(initutil.FlagNameP2PBLE, "true"))
		} else {
			args = append(args, ArgSet(initutil.FlagNameP2PBLE, "false"))
		}
	}

	if !hasP2PMCFlag {
		val := m.AppleMultipeerConnectivity
		if val == NetworkConfig_Undefined {
			val = defaultConfig.AppleMultipeerConnectivity
		}

		if mc.Supported && val == NetworkConfig_Enabled {
			args = append(args, ArgSet(initutil.FlagNameP2PMultipeerConnectivity, "true"))
		} else {
			args = append(args, ArgSet(initutil.FlagNameP2PMultipeerConnectivity, "false"))
		}
	}

	if !hasP2PNearbyFlag {
		val := m.AndroidNearby
		if val == NetworkConfig_Undefined {
			val = defaultConfig.AndroidNearby
		}

		if nb.Supported && val == NetworkConfig_Enabled {
			args = append(args, ArgSet(initutil.FlagNameP2PNearby, "true"))
		} else {
			args = append(args, ArgSet(initutil.FlagNameP2PNearby, "false"))
		}
	}

	return args
}

func ArgSet(flagName string, value string) string {
	return fmt.Sprintf("--%s=%s", flagName, value)
}

func ArgsHasWithPrefix(args []string, prefix string) bool {
	for _, val := range args {
		if strings.Contains(val, fmt.Sprintf("-%s=", prefix)) {
			return true
		}
	}

	return false
}
