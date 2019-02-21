package core

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"

	account "berty.tech/core/manager/account"
	"berty.tech/core/network"
	"berty.tech/core/pkg/logmanager"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var (
	accountName        = ""
	appConfig          *account.StateDB
	rootContext        = context.Background()
	NotificationDriver = MobileNotification{}.New()
)

// Setup call it at first native start

func logger() *zap.Logger {
	return zap.L().Named(defaultLoggerName)
}

func panicHandler() {
	if r := recover(); r != nil {
		panicErr := errors.New(fmt.Sprintf("panic from global export: %+v", r))
		logger().Error(panicErr.Error())
		if accountName == "" {
			return
		}
		a, err := account.Get(rootContext, accountName)
		if err != nil {
			return
		}
		a.ErrChan() <- panicErr
	}
}

func getRandomPort() (int, error) {
	addr, err := net.ResolveTCPAddr("tcp", "0.0.0.0:0")
	if err != nil {
		return 0, err
	}

	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
}

func Panic() {
	panic(nil)
}

func GetPort() (int, error) {
	defer panicHandler()

	a, err := account.Get(rootContext, accountName)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(strings.Split(a.GQLBind, ":")[1])
}

func Initialize(loggerNative NativeLogger, datastorePath string) error {
	defer panicHandler()

	if err := setupLogger("debug", datastorePath, loggerNative); err != nil {
		return err
	}

	initBleFunc()

	return nil
}

func ListAccounts() (string, error) {
	defer panicHandler()

	accounts, err := account.List(rootContext)
	if err != nil {
		return "", err
	}
	logger().Debug("ListAccounts", zap.Strings("acccounts", accounts))
	return strings.Join(accounts, ":"), nil
}

func initOrRestoreAppState() error {
	initialJSONNetConf, err := json.Marshal(initialNetConf)
	if err != nil {
		return err
	}

	// Needed by OpenStateDB to init DB if no previous config is found (first launch)
	initialState := account.StateDB{
		JSONNetConf: string(initialJSONNetConf),
		BotMode:     initialBotMode,
		LocalGRPC:   initiallocalGRPC,
	}

	appState, err := account.OpenStateDB("./berty.state.db", initialState)
	if err != nil {
		return errors.Wrap(err, "state DB init failed")
	}
	appConfig = appState
	logger().Debug("App state:", zap.Int("StartCounter", appConfig.StartCounter))
	logger().Debug("App state:", zap.String("JSONNetConf", appConfig.JSONNetConf))
	logger().Debug("App state:", zap.Bool("BotMode", appConfig.BotMode))
	logger().Debug("App state:", zap.Bool("LocalGRPC", appConfig.LocalGRPC))

	return nil
}

func Start(cfg *MobileOptions) error {
	if cfg == nil {
		return fmt.Errorf("core empty configuration")
	}

	accountName = cfg.nickname

	defer panicHandler()

	a, _ := account.Get(rootContext, cfg.nickname)
	if a != nil {
		// daemon already started, no errors to return
		return nil
	}

	if err := initOrRestoreAppState(); err != nil {
		return errors.Wrap(err, "app init/restore state failed")
	}

	run(cfg)
	waitDaemon(cfg.nickname)
	return nil
}

func Restart() error {
	defer panicHandler()

	currentAccount, _ := account.Get(rootContext, accountName)
	if currentAccount != nil {
		currentAccount.ErrChan() <- nil
	}

	waitDaemon(accountName)
	return nil
}

func DropDatabase() error {
	defer panicHandler()

	currentAccount, err := account.Get(rootContext, accountName)
	if err != nil {
		return err
	}
	err = currentAccount.DropDatabase(rootContext)
	if err != nil {
		return err
	}
	return Restart()
}

func run(cfg *MobileOptions) {
	go func() {
		for {
			err := daemon(cfg)
			if err != nil {
				logger().Error("handle error, try to restart", zap.Error(err))
				time.Sleep(time.Second)
			} else {
				logger().Info("restarting daemon")
			}
		}
	}()
}

func waitDaemon(nickname string) {
	currentAccount, _ := account.Get(rootContext, nickname)
	if currentAccount == nil || currentAccount.GQLBind == "" {
		logger().Debug("waiting for daemon to start")
		time.Sleep(time.Second)
		waitDaemon(nickname)
	}
}

func daemon(cfg *MobileOptions) error {
	defer panicHandler()
	_ = logmanager.G().LogRotate()

	grpcPort, err := getRandomPort()
	if err != nil {
		return err
	}
	gqlPort, err := getRandomPort()
	if err != nil {
		return err
	}

	var a *account.Account

	accountOptions := account.Options{
		account.WithNetwork(network.New(ctx, network.WithDefaultMobileOptions())),
		account.WithJaegerAddrName("jaeger.berty.io:6831", cfg.nickname+":mobile"),
		account.WithRing(logmanager.G().Ring()),
		account.WithName(cfg.nickname),
		account.WithPassphrase("secure"),
		account.WithNotificationDriver(NotificationDriver),
		account.WithDatabase(&account.DatabaseOptions{
			Path: ".",
			Drop: false,
		}),
		account.WithGrpcServer(&account.GrpcServerOptions{
			Bind:         fmt.Sprintf(":%d", grpcPort),
			Interceptors: false,
		}),
		account.WithGQL(&account.GQLOptions{
			Bind:         fmt.Sprintf(":%d", gqlPort),
			Interceptors: false,
		}),
	}

	if appConfig.BotMode {
		accountOptions = append(accountOptions, account.WithBot())
	}

	a, err = account.New(rootContext, accountOptions...)
	if err != nil {
		return err
	}
	defer account.Delete(rootContext, a)

	err = a.Open(rootContext)
	if err != nil {
		return err
	}
	defer a.Close(rootContext)

	if appConfig.LocalGRPC {
		err := StartLocalGRPC()
		if err != nil {
			logger().Error(err.Error())
			appConfig.LocalGRPC = false
		}
		// Continue if local gRPC fails (e.g wifi not connected)
		// Still re-enableable via toggle in devtools
	}
	logger().Debug("daemon started")
	return <-a.ErrChan()
}
