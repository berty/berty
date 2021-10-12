package bertyaccount

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gogo/protobuf/proto"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"moul.io/progress"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/accountutils"
	nb "berty.tech/berty/v2/go/internal/androidnearby"
	"berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/logutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
	"berty.tech/berty/v2/go/pkg/username"
)

func (s *service) openAccount(req *accounttypes.OpenAccount_Request, prog *progress.Progress) (*accounttypes.AccountMetadata, error) {
	args := req.GetArgs()

	if req.NetworkConfig == nil {
		req.NetworkConfig, _ = s.NetworkConfigForAccount(req.AccountID)
	}

	args = AddArgsUsingNetworkConfig(req.NetworkConfig, args)

	s.logger.Info("opening account with args", zap.Strings("args", args))

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

	errCleanup := func() {
		s.accountData = nil
	}

	args = append(args, "--store.dir", accountStorePath)

	if s.pushPlatformToken != nil {
		data, err := s.pushPlatformToken.Marshal()
		if err != nil {
			return nil, errcode.ErrSerialization.Wrap(err)
		}

		args = append(args, "--node.default-push-token", base64.RawURLEncoding.EncodeToString(data))
	}

	meta, err := s.updateAccountMetadataLastOpened(req.AccountID)
	if err != nil {
		errCleanup()
		return nil, errcode.ErrBertyAccountMetadataUpdate.Wrap(err)
	}

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
			errCleanup()
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
func (s *service) OpenAccount(ctx context.Context, req *accounttypes.OpenAccount_Request) (_ *accounttypes.OpenAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(ctx, s.logger, fmt.Sprintf("Opening account %s (AccountService)", req.AccountID))
	defer func() { endSection(err) }()

	if _, err := s.openAccount(req, nil); err != nil {
		return nil, errcode.ErrBertyAccountOpenAccount.Wrap(err)
	}

	return &accounttypes.OpenAccount_Reply{}, nil
}

// OpenAccountWithProgress is similar to OpenAccount, but also streams the progress.
func (s *service) OpenAccountWithProgress(req *accounttypes.OpenAccountWithProgress_Request, server accounttypes.AccountService_OpenAccountWithProgressServer) (err error) {
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
			err := server.Send(&accounttypes.OpenAccountWithProgress_Reply{
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
	typed := accounttypes.OpenAccount_Request{
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

func (s *service) CloseAccount(ctx context.Context, req *accounttypes.CloseAccount_Request) (_ *accounttypes.CloseAccount_Reply, err error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	endSection := tyber.SimpleSection(ctx, s.logger, "Closing account (AccountService)")
	defer func() { endSection(err) }()

	if s.initManager == nil {
		return &accounttypes.CloseAccount_Reply{}, nil
	}

	if l, err := s.initManager.GetLogger(); err == nil {
		_ = l.Sync() // cleanup logger
	}

	if err := s.initManager.Close(nil); err != nil {
		s.logger.Warn("unable to close account", zap.Error(err))
		return nil, errcode.ErrBertyAccountManagerClose.Wrap(err)
	}
	s.initManager = nil
	s.accountData = nil

	return &accounttypes.CloseAccount_Reply{}, nil
}

func (s *service) CloseAccountWithProgress(req *accounttypes.CloseAccountWithProgress_Request, server accounttypes.AccountService_CloseAccountWithProgressServer) (err error) {
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
			err := server.Send(&accounttypes.CloseAccountWithProgress_Reply{
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
	s.accountData = nil

	// wait
	<-done

	return nil
}

func (s *service) openManager(defaultLoggerStreams []logutil.Stream, args ...string) (*initutil.Manager, error) {
	manager, err := initutil.New(context.Background(), &initutil.ManagerOpts{
		DoNotSetDefaultDir:   true,
		DefaultLoggerStreams: defaultLoggerStreams,
		NativeKeystore:       s.nativeKeystore,
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
	manager.SetDevicePushKeyPath(s.devicePushKeyPath)
	manager.SetBleDriver(s.bleDriver)
	manager.SetNBDriver(s.nbDriver)

	return manager, nil
}

func (s *service) ListAccounts(_ context.Context, _ *accounttypes.ListAccounts_Request) (*accounttypes.ListAccounts_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	accounts, err := accountutils.ListAccounts(s.rootdir, s.logger)
	if err != nil {
		return nil, err
	}

	return &accounttypes.ListAccounts_Reply{
		Accounts: accounts,
	}, nil
}

func (s *service) getAccountMetaForName(accountID string) (*accounttypes.AccountMetadata, error) {
	return accountutils.GetAccountMetaForName(s.rootdir, accountID, s.logger)
}

func (s *service) DeleteAccount(ctx context.Context, request *accounttypes.DeleteAccount_Request) (_ *accounttypes.DeleteAccount_Reply, err error) {
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

	return &accounttypes.DeleteAccount_Reply{}, nil
}

func (s *service) updateAccountMetadataLastOpened(accountID string) (*accounttypes.AccountMetadata, error) {
	meta, err := s.getAccountMetaForName(accountID)
	if err != nil {
		return nil, err
	}

	meta.LastOpened = time.Now().UnixNano() / 1000

	metaBytes, err := proto.Marshal(meta)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	metafileName := filepath.Join(s.rootdir, accountID, accountutils.AccountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = accountID
	s.accountData = meta

	return meta, nil
}

func (s *service) createAccountMetadata(accountID string, name string) (*accounttypes.AccountMetadata, error) {
	if _, err := s.getAccountMetaForName(accountID); err == nil {
		return nil, errcode.ErrBertyAccountAlreadyExists
	} else if !errcode.Is(err, errcode.ErrBertyAccountDataNotFound) {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	accountStorePath := filepath.Join(s.rootdir, accountID)
	if err := os.MkdirAll(accountStorePath, 0o700); err != nil {
		return nil, err
	}

	meta := &accounttypes.AccountMetadata{
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

	metafileName := filepath.Join(s.rootdir, accountID, accountutils.AccountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = accountID

	return meta, nil
}

func (s *service) ImportAccountWithProgress(req *accounttypes.ImportAccountWithProgress_Request, server accounttypes.AccountService_ImportAccountWithProgressServer) (err error) {
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
			err := server.Send(&accounttypes.ImportAccountWithProgress_Reply{
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

	typed := accounttypes.ImportAccount_Request{
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
		err = server.Send(&accounttypes.ImportAccountWithProgress_Reply{
			AccountMetadata: ret.AccountMetadata,
		})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (s *service) ImportAccount(ctx context.Context, req *accounttypes.ImportAccount_Request) (_ *accounttypes.ImportAccount_Reply, err error) {
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

func (s *service) importAccount(ctx context.Context, req *accounttypes.ImportAccount_Request, prog *progress.Progress) (_ *accounttypes.ImportAccount_Reply, err error) {
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

	meta, err := s.createAccount(&accounttypes.CreateAccount_Request{
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

	meta, err = s.updateAccount(&accounttypes.UpdateAccount_Request{
		AccountID:   meta.AccountID,
		AccountName: a.Account.DisplayName,
		PublicKey:   a.Account.PublicKey,
		AvatarCID:   a.Account.AvatarCID,
	})
	if err != nil {
		return nil, errcode.ErrBertyAccountUpdateFailed.Wrap(err)
	}

	return &accounttypes.ImportAccount_Reply{
		AccountMetadata: meta,
	}, nil
}

func (s *service) createAccount(req *accounttypes.CreateAccount_Request, prog *progress.Progress) (*accounttypes.AccountMetadata, error) {
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

	meta, err := s.openAccount(&accounttypes.OpenAccount_Request{
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

func (s *service) CreateAccount(ctx context.Context, req *accounttypes.CreateAccount_Request) (_ *accounttypes.CreateAccount_Reply, err error) {
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

	return &accounttypes.CreateAccount_Reply{
		AccountMetadata: meta,
	}, nil
}

func (s *service) updateAccount(req *accounttypes.UpdateAccount_Request) (*accounttypes.AccountMetadata, error) {
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

	metafileName := filepath.Join(s.rootdir, req.AccountID, accountutils.AccountMetafileName)
	if err := ioutil.WriteFile(metafileName, metaBytes, 0o600); err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	meta.AccountID = req.AccountID
	s.accountData = meta

	return meta, nil
}

func (s *service) UpdateAccount(ctx context.Context, req *accounttypes.UpdateAccount_Request) (_ *accounttypes.UpdateAccount_Reply, err error) {
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

	return &accounttypes.UpdateAccount_Reply{
		AccountMetadata: meta,
	}, nil
}

func (s *service) GetUsername(_ context.Context, _ *accounttypes.GetUsername_Request) (_ *accounttypes.GetUsername_Reply, err error) {
	return &accounttypes.GetUsername_Reply{
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

func NetworkConfigGetDefault() *accounttypes.NetworkConfig {
	defaultRDVPeerMaddrs := make([]string, len(config.Config.P2P.RDVP))
	for i := range config.Config.P2P.RDVP {
		defaultRDVPeerMaddrs[i] = config.Config.P2P.RDVP[i].Maddr
	}

	return &accounttypes.NetworkConfig{
		Bootstrap:                  []string{initutil.KeywordDefault},
		Rendezvous:                 []string{initutil.KeywordDefault},
		StaticRelay:                []string{initutil.KeywordDefault},
		DHT:                        accounttypes.NetworkConfig_DHTClient,
		BluetoothLE:                accounttypes.NetworkConfig_Disabled,
		AndroidNearby:              accounttypes.NetworkConfig_Disabled,
		AppleMultipeerConnectivity: accounttypes.NetworkConfig_Disabled,
		MDNS:                       accounttypes.NetworkConfig_Enabled,
		Tor:                        accounttypes.NetworkConfig_TorDisabled,
	}
}

func NetworkConfigGetBlank() *accounttypes.NetworkConfig {
	return &accounttypes.NetworkConfig{
		Bootstrap:                  []string{initutil.KeywordDefault},
		Rendezvous:                 []string{initutil.KeywordDefault},
		StaticRelay:                []string{initutil.KeywordDefault},
		DHT:                        accounttypes.NetworkConfig_DHTUndefined,
		BluetoothLE:                accounttypes.NetworkConfig_Undefined,
		AndroidNearby:              accounttypes.NetworkConfig_Undefined,
		AppleMultipeerConnectivity: accounttypes.NetworkConfig_Undefined,
		MDNS:                       accounttypes.NetworkConfig_Undefined,
		Tor:                        accounttypes.NetworkConfig_TorUndefined,
	}
}

func (s *service) NetworkConfigForAccount(accountID string) (*accounttypes.NetworkConfig, bool) {
	netConfName := filepath.Join(s.rootdir, accountID, accountutils.AccountNetConfFileName)
	netConfBytes, err := ioutil.ReadFile(netConfName)
	if os.IsNotExist(err) {
		return NetworkConfigGetDefault(), false
	} else if err != nil {
		s.logger.Warn("unable to read network configuration for account", zap.Error(err), zap.String("account-id", accountID))
		return NetworkConfigGetDefault(), false
	}

	ret := &accounttypes.NetworkConfig{}
	if err := ret.Unmarshal(netConfBytes); err != nil {
		s.logger.Warn("unable to parse network configuration for account", zap.Error(err), zap.String("account-id", accountID))
		return NetworkConfigGetDefault(), false
	}

	return ret, true
}

func (s *service) NetworkConfigGet(ctx context.Context, request *accounttypes.NetworkConfigGet_Request) (*accounttypes.NetworkConfigGet_Reply, error) {
	defaultConfig := NetworkConfigGetDefault()
	currentConfig, isCustomConfig := s.NetworkConfigForAccount(request.AccountID)

	return &accounttypes.NetworkConfigGet_Reply{
		DefaultConfig:      defaultConfig,
		CurrentConfig:      currentConfig,
		CustomConfigExists: isCustomConfig,
		DefaultBootstrap:   ipfs_cfg.DefaultBootstrapAddresses,
		DefaultRendezvous:  config.GetDefaultRDVPMaddr(),
		DefaultStaticRelay: config.Config.P2P.StaticRelays,
	}, nil
}

func SanitizeCheckMultiAddr(addrs []string) error {
	for _, addr := range addrs {
		switch addr {
		case initutil.KeywordNone:
			if len(addrs) != 1 {
				return errcode.ErrInvalidInput.Wrap(fmt.Errorf("only a single value is expected while using %s", initutil.KeywordNone))
			}
		case initutil.KeywordDefault:
			// ignoring
		default:
			if _, err := ma.NewMultiaddr(addr); err != nil {
				return errcode.ErrInvalidInput.Wrap(err)
			}
		}
	}

	return nil
}

func (s *service) saveNetworkConfigForAccount(accountID string, networkConfig *accounttypes.NetworkConfig) error {
	if networkConfig == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no network config provided"))
	}

	// TODO: allow Tor when available
	if networkConfig.Tor != accounttypes.NetworkConfig_TorUndefined && networkConfig.Tor != accounttypes.NetworkConfig_TorDisabled {
		s.logger.Warn("tor is set to required, downgrading to disabled as not yet supported")
		networkConfig.Tor = accounttypes.NetworkConfig_TorDisabled
	}

	// Sanitize check network config multi addrs
	{
		for key, addrs := range map[string][]string{
			"Bootstrap":   networkConfig.Bootstrap,
			"Rendezvous":  networkConfig.Rendezvous,
			"StaticRelay": networkConfig.StaticRelay,
		} {
			if err := SanitizeCheckMultiAddr(addrs); err != nil {
				return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid format for %s maddrs: %w", key, err))
			}
		}
	}

	data, err := networkConfig.Marshal()
	if err != nil {
		return err
	}

	netConfName := filepath.Join(s.rootdir, accountID, accountutils.AccountNetConfFileName)
	if err := ioutil.WriteFile(netConfName, data, 0o600); err != nil {
		return err
	}

	return nil
}

func (s *service) NetworkConfigSet(ctx context.Context, request *accounttypes.NetworkConfigSet_Request) (*accounttypes.NetworkConfigSet_Reply, error) {
	if err := s.saveNetworkConfigForAccount(request.AccountID, request.Config); err != nil {
		return nil, err
	}

	return &accounttypes.NetworkConfigSet_Reply{}, nil
}

func AddArgsUsingNetworkConfig(m *accounttypes.NetworkConfig, args []string) []string {
	defaultConfig := NetworkConfigGetDefault()

	if !ArgsHasWithPrefix(args, initutil.FlagNameTorMode) {
		torFlag := m.Tor
		if torFlag == accounttypes.NetworkConfig_TorUndefined {
			torFlag = defaultConfig.Tor
		}

		if torValue, ok := map[accounttypes.NetworkConfig_TorFlag]string{
			accounttypes.NetworkConfig_TorUndefined: "disabled",
			accounttypes.NetworkConfig_TorDisabled:  "disabled",
			accounttypes.NetworkConfig_TorOptional:  "optional",
			accounttypes.NetworkConfig_TorRequired:  "required",
		}[torFlag]; ok {
			args = append(args, ArgSet(initutil.FlagNameTorMode, torValue))
		}
	}

	args = addListValueArgs(args, initutil.FlagNameP2PBootstrap, []string{initutil.KeywordNone}, m.Bootstrap)
	args = addListValueArgs(args, initutil.FlagNameP2PStaticRelays, []string{initutil.KeywordNone}, m.StaticRelay)
	args = addListValueArgs(args, initutil.FlagNameP2PRDVP, []string{initutil.KeywordNone}, m.Rendezvous)

	args = addFlagValueArgs(args, initutil.FlagNameP2PBLE, ble.Supported, defaultConfig.BluetoothLE, m.BluetoothLE)
	args = addFlagValueArgs(args, initutil.FlagNameP2PMultipeerConnectivity, mc.Supported, defaultConfig.AppleMultipeerConnectivity, m.AppleMultipeerConnectivity)
	args = addFlagValueArgs(args, initutil.FlagNameP2PNearby, nb.Supported, defaultConfig.AndroidNearby, m.AndroidNearby)
	args = addFlagValueArgs(args, initutil.FlagNameP2PMDNS, true, defaultConfig.MDNS, m.MDNS)

	args = AddDHTArgsUsingNetworkConfig(m, args, defaultConfig)
	args = AddRDVPArgsUsingNetworkConfig(m, args, defaultConfig)

	return args
}

func addListValueArgs(args []string, flagName string, defaultValue, currentValue []string) []string {
	if !ArgsHasWithPrefix(args, flagName) {
		if len(currentValue) == 0 {
			currentValue = defaultValue
		}

		args = append(args, ArgSet(flagName, strings.Join(currentValue, ",")))
	}

	return args
}

func addFlagValueArgs(args []string, flagName string, platformSupported bool, defaultValue, currentValue accounttypes.NetworkConfig_Flag) []string {
	if hasFlag := ArgsHasWithPrefix(args, flagName); hasFlag {
		return args
	}

	if currentValue == accounttypes.NetworkConfig_Undefined {
		currentValue = defaultValue
	}

	flagVal := "false"
	if platformSupported && currentValue == accounttypes.NetworkConfig_Enabled {
		flagVal = "true"
	}

	return append(args, ArgSet(flagName, flagVal))
}

func AddRDVPArgsUsingNetworkConfig(m *accounttypes.NetworkConfig, args []string, defaultConfig *accounttypes.NetworkConfig) []string {
	if !ArgsHasWithPrefix(args, initutil.FlagNameP2PTinderRDVPDriver) && !ArgsHasWithPrefix(args, initutil.FlagNameP2PRDVP) {
		rdvpDisabled := false
		rdvpHosts := m.Rendezvous
		if len(m.Rendezvous) == 0 {
			rdvpHosts = defaultConfig.Rendezvous
		}

		if len(rdvpHosts) == 0 {
			rdvpDisabled = true
		} else {
			for _, val := range rdvpHosts {
				if val == initutil.KeywordNone {
					rdvpDisabled = true
					break
				}
			}
		}

		if !rdvpDisabled {
			args = append(args, ArgSet(initutil.FlagNameP2PTinderRDVPDriver, "true"))
		} else {
			args = append(args, ArgSet(initutil.FlagNameP2PTinderRDVPDriver, "false"))
		}
	}

	return args
}

func AddDHTArgsUsingNetworkConfig(m *accounttypes.NetworkConfig, args []string, defaultConfig *accounttypes.NetworkConfig) []string {
	hasTinderDHTDriverFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PTinderDHTDriver)
	hasDHTFlag := ArgsHasWithPrefix(args, initutil.FlagNameP2PDHT)

	dhtDisabled := false
	if !hasDHTFlag {
		dhtFlag := m.DHT
		if dhtFlag == accounttypes.NetworkConfig_DHTUndefined {
			dhtFlag = defaultConfig.DHT
		}

		if dhtValue, ok := map[accounttypes.NetworkConfig_DHTFlag]string{
			accounttypes.NetworkConfig_DHTClient:     initutil.FlagValueP2PDHTClient,
			accounttypes.NetworkConfig_DHTServer:     initutil.FlagValueP2PDHTServer,
			accounttypes.NetworkConfig_DHTAuto:       initutil.FlagValueP2PDHTAuto,
			accounttypes.NetworkConfig_DHTAutoServer: initutil.FlagValueP2PDHTAutoServer,
			accounttypes.NetworkConfig_DHTDisabled:   initutil.FlagValueP2PDHTDisabled,
			accounttypes.NetworkConfig_DHTUndefined:  initutil.FlagValueP2PDHTDisabled,
		}[dhtFlag]; ok {
			args = append(args, ArgSet(initutil.FlagNameP2PDHT, dhtValue))

			if dhtValue == initutil.FlagValueP2PDHTDisabled {
				dhtDisabled = true
			}
		}
	}

	if !hasTinderDHTDriverFlag {
		if !dhtDisabled {
			args = append(args, ArgSet(initutil.FlagNameP2PTinderDHTDriver, "true"))
		} else {
			args = append(args, ArgSet(initutil.FlagNameP2PTinderDHTDriver, "false"))
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

func (s *service) PushReceive(ctx context.Context, req *accounttypes.PushReceive_Request) (*accounttypes.PushReceive_Reply, error) {
	payload, err := base64.StdEncoding.DecodeString(req.Payload)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	initManager, err := s.getInitManager()
	if err != nil {
		s.logger.Warn("unable to retrieve init manager", zap.Error(err))
		initManager = nil
	}

	s.muService.Lock()
	defer s.muService.Unlock()

	excludedAccounts := []string(nil)

	accData := s.accountData
	if initManager != nil && accData != nil {
		excludedAccounts = append(excludedAccounts, accData.AccountID)

		client, err := initManager.GetMessengerClient()
		if err == nil && client != nil {
			rep, err := client.PushReceive(ctx, &messengertypes.PushReceive_Request{Payload: payload})
			if err == nil {
				pushData, err := bertypush.PushEnrich(rep.Data, accData, s.logger)
				if err == nil {
					return &accounttypes.PushReceive_Reply{
						PushData: pushData,
					}, nil
				}

				s.logger.Warn("unable to enrich push data", zap.Error(err))
				// TODO: should we return early?
			}

			s.logger.Warn("unable to open push using currently opened account", zap.Error(err))
		} else if err != nil {
			s.logger.Warn("unable to get currently opened account", zap.Error(err))
		}
	}

	rawPushData, accountData, err := bertypush.PushDecrypt(ctx, s.rootdir, payload, &bertypush.PushDecryptOpts{
		Logger: s.logger, ExcludedAccounts: excludedAccounts, StorageKey: s.storageKey,
	})
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	pushData, err := bertypush.PushEnrich(rawPushData, accountData, s.logger)
	if err != nil {
		s.logger.Warn("unable to enrich push data", zap.Error(err))
		// TODO: should we return early?
	}

	return &accounttypes.PushReceive_Reply{
		PushData: pushData,
	}, nil
}

func (s *service) PushPlatformTokenRegister(ctx context.Context, request *accounttypes.PushPlatformTokenRegister_Request) (*accounttypes.PushPlatformTokenRegister_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	pushPK, _, err := accountutils.GetDevicePushKeyForPath(s.devicePushKeyPath, true)
	if err != nil {
		return nil, err
	}

	request.Receiver.RecipientPublicKey = pushPK[:]

	s.pushPlatformToken = &protocoltypes.PushServiceReceiver{
		TokenType:          request.Receiver.TokenType,
		BundleID:           request.Receiver.BundleID,
		Token:              request.Receiver.Token,
		RecipientPublicKey: request.Receiver.RecipientPublicKey,
	}

	if s.initManager == nil {
		return &accounttypes.PushPlatformTokenRegister_Reply{}, nil
	}

	client, err := s.initManager.GetProtocolClient()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if _, err := client.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{Receiver: request.Receiver}); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &accounttypes.PushPlatformTokenRegister_Reply{}, nil
}
