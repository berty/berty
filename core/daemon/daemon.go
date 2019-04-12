package daemon

import (
	"context"
	"encoding/json"
	fmt "fmt"
	"net"
	"regexp"
	"strconv"
	"strings"

	account "berty.tech/core/manager/account"
	"berty.tech/core/network"
	network_config "berty.tech/core/network/config"
	"berty.tech/core/pkg/notification"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type localGRPCInfos struct {
	IsRunning bool
	LocalAddr string
}

type Daemon struct {
	cancel context.CancelFunc
	config *Config

	grpcListener net.Listener
	appConfig    *account.StateDB
	rootContext  context.Context
	accountName  string

	// Network
	NetworkConfig network_config.Option

	// Module
	Logger       NativeLogger
	Notification notification.Driver
}

func New() *Daemon {
	return &Daemon{
		rootContext:  context.Background(),
		accountName:  "",
		Notification: notification.NewNoopNotification(),
		Logger:       &NoopLogger{},
	}
}

func getLocalIP() (string, error) {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return "", errors.Wrap(err, "can't get local IP")
	}

	localIP := conn.LocalAddr().(*net.UDPAddr).IP.String()
	conn.Close()

	localIPRegex := "(^127\\.)|(^10\\.)|(^172\\.1[6-9]\\.)|(^172\\.2[0-9]\\.)|(^172\\.3[0-1]\\.)|(^192\\.168\\.)"
	isLocal, err := regexp.MatchString(localIPRegex, localIP)
	if err != nil {
		return "", errors.Wrap(err, "can't get local IP")
	}

	if !isLocal {
		return "", errors.New("no local IP found (wifi probably disconnected)")
	}

	logger().Debug("local IP available")
	return localIP, nil
}

// @TODO: implem this
func (d *Daemon) Initialize(ctx context.Context, cfg *Config) (*Void, error) {
	d.config = cfg
	return &Void{}, nil
}

func (d *Daemon) Start(ctx context.Context, req *StartRequest) (*Void, error) {
	var err error

	if d.config == nil || d.config.SqlOpts == nil {
		return &Void{}, errors.New("no config/SqlPath set, initialize first")
	}

	initialState := account.StateDB{
		BotMode:   initialBotMode,
		LocalGRPC: initiallocalGRPC,
	}

	d.appConfig, err = account.OpenStateDB(d.config.SqlOpts.Name, initialState)
	if err != nil {
		return &Void{}, errors.Wrap(err, "state DB init failed")
	}

	currentAccount, _ := account.Get(d.rootContext, req.Nickname)
	if currentAccount != nil {
		// daemon already started, no errors to return
		return &Void{}, fmt.Errorf("daemon already started")
	}

	d.accountName = req.Nickname

	logger().Debug("App state:", zap.Int("StartCounter", d.appConfig.StartCounter))
	logger().Debug("App state:", zap.String("JSONNetConf", d.appConfig.JSONNetConf))
	logger().Debug("App state:", zap.Bool("BotMode", d.appConfig.BotMode))
	logger().Debug("App state:", zap.Bool("LocalGRPC", d.appConfig.LocalGRPC))

	var cctx context.Context
	cctx, d.cancel = context.WithCancel(d.rootContext)

	return &Void{}, d.daemon(cctx, d.config, req.Nickname)
}

func (d *Daemon) DropDatabase(ctx context.Context, _ *Void) (*Void, error) {
	currentAccount, err := account.Get(d.rootContext, d.accountName)
	if err != nil {
		return &Void{}, err
	}

	return nil, currentAccount.DropDatabase(d.rootContext)
}

func (d *Daemon) GetLocalGrpcInfos(ctx context.Context, _ *Void) (*GRPCInfos, error) {
	localAddr, err := getLocalIP()
	if err == nil {
		localAddr = fmt.Sprintf("%s:%d", localAddr, defaultLocalGRPCPort)
	}

	infos := &localGRPCInfos{
		IsRunning: d.grpcListener != nil,
		LocalAddr: localAddr,
	}

	infosJSON, err := json.Marshal(infos)
	if err != nil {
		return nil, err
	}

	return &GRPCInfos{
		Json: string(infosJSON),
	}, nil
}

func (d *Daemon) GetNetworkConfig(ctx context.Context, _ *Void) (*NetworkConfig, error) {
	a, err := account.Get(d.rootContext, d.accountName)
	if err != nil {
		return nil, err
	}

	cfg := a.Network().Config()
	data, err := json.Marshal(cfg)
	if err != nil {
		return nil, err
	}

	return &NetworkConfig{
		Json: string(data),
	}, nil
}

func (d *Daemon) GetPort(context.Context, *Void) (*GetPortResponse, error) {
	a, err := account.Get(d.rootContext, d.accountName)
	if err != nil {
		return nil, err
	}

	ia, err := strconv.Atoi(strings.Split(a.GQLBind, ":")[1])
	if err != nil {
		return nil, err
	}

	return &GetPortResponse{
		Port: int32(ia),
	}, nil
}

func (d *Daemon) GetBotState(context.Context, *Void) (*BotState, error) {
	currentAccount, err := account.Get(d.rootContext, d.accountName)
	if err != nil {
		return nil, err
	}

	return &BotState{
		IsBotRunning: currentAccount.BotRunning,
	}, nil
}

func (d *Daemon) ListAccounts(context.Context, *Void) (*ListAccountsResponse, error) {
	accounts, err := account.List(d.rootContext)
	if err != nil {
		return nil, err
	}

	logger().Debug("ListAccounts", zap.Strings("acccounts", accounts))
	return &ListAccountsResponse{
		Accounts: accounts,
	}, nil
}

func (d *Daemon) Panic(context.Context, *Void) (*Void, error) {
	panic("daemon panic !")
}

func (d *Daemon) Restart(ctx context.Context, _ *Void) (*Void, error) {
	currentAccount, err := account.Get(d.rootContext, d.accountName)
	if currentAccount != nil {
		currentAccount.ErrChan() <- nil
	}

	return nil, err
}

func (d *Daemon) SetCurrentRoute(context.Context, *Void) (*Void, error) {
	return &Void{}, fmt.Errorf("not implemented")
}

func (d *Daemon) StartBot(context.Context, *Void) (*Void, error) {
	currentAccount, _ := account.Get(d.rootContext, d.accountName)
	if currentAccount.BotRunning {
		return nil, errors.New("bot is already started")
	}

	return &Void{}, currentAccount.StartBot(d.rootContext)
}

func (d *Daemon) StopBot(context.Context, *Void) (*Void, error) {
	currentAccount, _ := account.Get(d.rootContext, d.accountName)

	if !currentAccount.BotRunning {
		return nil, errors.New("bot is already stopped")
	}

	return &Void{}, nil
}

func (d *Daemon) StartLocalGRPC(context.Context, *Void) (*Void, error) {
	currentAccount, err := account.Get(d.rootContext, d.accountName)
	if err != nil {
		return nil, err
	}

	if d.grpcListener != nil {
		return nil, errors.New("local gRPC is already running")
	}

	localIP, err := getLocalIP()
	if err != nil {
		return nil, errors.Wrap(err, "start local gRPC failed")
	}

	addr := fmt.Sprintf("%s:%d", localIP, defaultLocalGRPCPort)
	d.grpcListener, err = net.Listen("tcp", addr)
	if err != nil {
		return nil, errors.Wrap(err, "start local gRPC failed")
	}

	d.appConfig.LocalGRPC = true
	d.appConfig.StartCounter++
	if err := d.appConfig.Save(); err != nil {
		return nil, errors.Wrap(err, "state DB save failed")
	}

	logger().Debug("local gRPC listener started", zap.String("addr", addr))

	go func() {
		if err := currentAccount.GrpcServer.Serve(d.grpcListener); err != nil {
			logger().Error("local grpc server stopped", zap.Error(err))
			d.appConfig.LocalGRPC = false
		}
	}()

	return &Void{}, nil
}

func (d *Daemon) StopLocalGRPC(context.Context, *Void) (*Void, error) {
	if d.grpcListener == nil {
		return nil, errors.New("local gRPC is already stopped")
	}

	if err := d.grpcListener.Close(); err != nil {
		return nil, errors.Wrap(err, "stop local gRPC failed")
	}

	d.grpcListener = nil
	d.appConfig.LocalGRPC = false
	d.appConfig.StartCounter++
	if err := d.appConfig.Save(); err != nil {
		return nil, errors.Wrap(err, "state DB save failed")
	}

	return &Void{}, nil
}

func (d *Daemon) UpdateNetworkConfig(ctx context.Context, nc *NetworkConfig) (*Void, error) {
	currentAccount, _ := account.Get(d.rootContext, d.accountName)

	cfg := &network_config.Config{}
	if err := json.Unmarshal([]byte(nc.Json), cfg); err != nil {
		return &Void{}, err
	}

	if err := currentAccount.UpdateNetwork(
		d.rootContext,
		network.WithConfig(cfg),
		network.OverridePersistConfig(),
	); err != nil {
		return &Void{}, err
	}

	return &Void{}, nil
}
